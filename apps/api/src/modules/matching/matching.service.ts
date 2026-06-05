import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PineconeService } from '../pinecone/pinecone.service';
import { OpenAIService } from '../openai/openai.service';
import { User } from '@prisma/client';

// ============================================================
// FANVERSE 2026 — AI FAN MATCHING SERVICE
//
// Hybrid matching system:
// 1. Hard filters (same city, active dates, not blocked)
// 2. Embedding-based similarity search (Pinecone)
// 3. Collaborative scoring (shared tickets, interests, language)
// 4. Final ranked list with match reasons and icebreaker
// ============================================================

export interface FanMatch {
  user: Partial<User>;
  score: number;                // 0-1 composite score
  reasons: MatchReason[];       // Why they matched
  icebreaker: string;           // AI-generated conversation starter
  sharedMatches: string[];      // Same match IDs
  sharedInterests: string[];    // Common interests
}

export interface MatchReason {
  type: 'same_match' | 'shared_interest' | 'same_city' | 'language_compatible' | 'similar_age';
  weight: number;
  label: string;
}

interface UserEmbeddingInput {
  nationality: string;
  supportedTeam: string;
  interests: string[];
  languages: string[];
  ageRange: string;
  hostCities: string[];
  bio: string;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  // Scoring weights — tunable via config
  private readonly WEIGHTS = {
    SAME_MATCH_TICKET: 0.40,
    SHARED_INTEREST: 0.20,
    LANGUAGE_COMPATIBLE: 0.15,
    SAME_CITY_OVERLAP: 0.10,
    EMBEDDING_SIMILARITY: 0.10,
    SAME_AGE_RANGE: 0.05,
  };

  constructor(
    private prisma: PrismaService,
    private pinecone: PineconeService,
    private openai: OpenAIService,
    private config: ConfigService,
  ) {}

  // ============================================================
  // MAIN: Get fan matches for a user
  // ============================================================

  async getFanMatches(
    userId: string,
    options: {
      limit?: number;
      cityFilter?: string;
      matchFilter?: string;
    } = {},
  ): Promise<FanMatch[]> {
    const { limit = 20, cityFilter, matchFilter } = options;

    // 1. Load requesting user with full context
    const requestingUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { tickets: { include: { match: true } } },
    });

    if (requestingUser.isBanned) {
      return [];
    }

    // 2. Get blocked/declined users to exclude
    const excludedIds = await this.getExcludedUserIds(userId);
    excludedIds.push(userId); // Always exclude self

    // 3. Get embedding-similar users from Pinecone
    const embeddingCandidates = await this.pinecone.querySimilarUsers(
      userId,
      { topK: 100, filter: { citySlug: cityFilter } },
    );

    const candidateIds = embeddingCandidates
      .filter(c => !excludedIds.includes(c.id))
      .map(c => c.id);

    // 4. Load candidate users with their tickets
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { in: candidateIds },
        isBanned: false,
        // Must be active in last 7 days
        lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        // City overlap
        ...(cityFilter && { hostCities: { has: cityFilter } }),
      },
      include: {
        tickets: {
          include: { match: true },
        },
      },
      take: 100,
    });

    // 5. Score each candidate
    const scored = await Promise.all(
      candidates.map(async (candidate) => {
        const score = this.computeMatchScore(requestingUser, candidate);
        return { user: candidate, ...score };
      }),
    );

    // 6. Sort by score, take top N
    const topMatches = scored
      .filter(m => m.score > 0.1)  // Minimum threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // 7. Generate icebreakers in parallel (only for top matches)
    const withIcebreakers = await Promise.all(
      topMatches.slice(0, 10).map(async (match) => ({
        ...match,
        icebreaker: await this.generateIcebreaker(requestingUser, match.user as User, match.reasons),
        user: this.sanitizeUserForMatch(match.user as User),
      })),
    );

    // Append remaining without icebreakers (generated on demand)
    const remaining = topMatches.slice(10).map(m => ({
      ...m,
      icebreaker: '',
      user: this.sanitizeUserForMatch(m.user as User),
    }));

    return [...withIcebreakers, ...remaining];
  }

  // ============================================================
  // SCORING ENGINE
  // ============================================================

  private computeMatchScore(
    user: User & { tickets: any[] },
    candidate: User & { tickets: any[] },
  ): { score: number; reasons: MatchReason[]; sharedMatches: string[]; sharedInterests: string[] } {
    let score = 0;
    const reasons: MatchReason[] = [];

    // --- Same match attendance (highest weight) ---
    const userMatchIds = new Set(user.tickets.map(t => t.matchId));
    const sharedMatches = candidate.tickets
      .filter(t => userMatchIds.has(t.matchId))
      .map(t => t.matchId);

    if (sharedMatches.length > 0) {
      const matchBonus = Math.min(sharedMatches.length * this.WEIGHTS.SAME_MATCH_TICKET, 0.5);
      score += matchBonus;
      reasons.push({
        type: 'same_match',
        weight: matchBonus,
        label: `Attending ${sharedMatches.length} same match${sharedMatches.length > 1 ? 'es' : ''}`,
      });
    }

    // --- Shared interests ---
    const userInterests = new Set(user.interests);
    const sharedInterests = candidate.interests.filter(i => userInterests.has(i));

    if (sharedInterests.length > 0) {
      const interestBonus = Math.min(
        (sharedInterests.length / Math.max(user.interests.length, 1)) * this.WEIGHTS.SHARED_INTEREST,
        this.WEIGHTS.SHARED_INTEREST,
      );
      score += interestBonus;
      if (interestBonus > 0.02) {
        reasons.push({
          type: 'shared_interest',
          weight: interestBonus,
          label: `Love ${sharedInterests.slice(0, 2).join(' & ')}`,
        });
      }
    }

    // --- Language compatibility ---
    const userLangs = new Set(user.languages);
    const commonLangs = candidate.languages.filter(l => userLangs.has(l));

    if (commonLangs.length > 0) {
      const langBonus = this.WEIGHTS.LANGUAGE_COMPATIBLE;
      score += langBonus;
      reasons.push({
        type: 'language_compatible',
        weight: langBonus,
        label: `Speak ${commonLangs[0]}`,
      });
    }

    // --- City overlap ---
    const userCities = new Set(user.hostCities);
    const sharedCities = candidate.hostCities.filter(c => userCities.has(c));

    if (sharedCities.length > 0) {
      const cityBonus = this.WEIGHTS.SAME_CITY_OVERLAP;
      score += cityBonus;
    }

    // --- Age range ---
    if (user.ageRange && candidate.ageRange && user.ageRange === candidate.ageRange) {
      score += this.WEIGHTS.SAME_AGE_RANGE;
      reasons.push({
        type: 'similar_age',
        weight: this.WEIGHTS.SAME_AGE_RANGE,
        label: 'Similar age group',
      });
    }

    return {
      score: Math.min(score, 1),
      reasons: reasons.sort((a, b) => b.weight - a.weight),
      sharedMatches,
      sharedInterests,
    };
  }

  // ============================================================
  // AI ICEBREAKER GENERATION
  // ============================================================

  async generateIcebreaker(
    user: User,
    match: User,
    reasons: MatchReason[],
  ): Promise<string> {
    try {
      const context = {
        userNationality: user.nationality,
        userTeam: user.supportedTeam,
        userInterests: user.interests.slice(0, 3),
        matchNationality: match.nationality,
        matchTeam: match.supportedTeam,
        matchInterests: match.interests.slice(0, 3),
        sharedReasons: reasons.map(r => r.label),
      };

      const prompt = `You are a friendly World Cup fan companion. Generate ONE natural, warm conversation starter (max 2 sentences) for two fans who just matched on FanVerse 2026.

Context:
- Fan A: ${context.userNationality} fan supporting ${context.userTeam}, interests: ${context.userInterests.join(', ')}
- Fan B: ${context.matchNationality} fan supporting ${context.matchTeam}, interests: ${context.matchInterests.join(', ')}
- Why they matched: ${context.sharedReasons.join(', ')}

Write a warm, specific, exciting icebreaker that references their shared connection. Do not mention "FanVerse". Be natural and enthusiastic. Max 60 words.`;

      const response = await this.openai.generateText(prompt, {
        maxTokens: 100,
        temperature: 0.8,
      });

      return response;
    } catch (error) {
      this.logger.warn('Icebreaker generation failed, using fallback');
      return this.getFallbackIcebreaker(reasons);
    }
  }

  private getFallbackIcebreaker(reasons: MatchReason[]): string {
    const topReason = reasons[0];
    if (!topReason) return "You both love the beautiful game — this World Cup is going to be incredible!";

    const templates: Record<string, string[]> = {
      same_match: [
        "You're both at the same match! Compare notes on the best seat in the stadium?",
        "Fellow match-day fans! Where are you watching from?",
      ],
      shared_interest: [
        "You share a passion for the same things — sounds like you'd have a lot to talk about!",
        "Similar vibes, similar interests — this could be the start of a great World Cup friendship!",
      ],
      language_compatible: [
        "You speak the same language — literally! Perfect for match day conversations.",
      ],
      same_city: [
        "You're both in the same city — great chance to explore together!",
      ],
    };

    const options = templates[topReason.type] ?? templates.same_match;
    return options[Math.floor(Math.random() * options.length)];
  }

  // ============================================================
  // USER EMBEDDING GENERATION
  // ============================================================

  async generateAndStoreUserEmbedding(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { tickets: { include: { match: true } } },
    });

    const embeddingInput: UserEmbeddingInput = {
      nationality: user.nationality ?? '',
      supportedTeam: user.supportedTeam ?? '',
      interests: user.interests,
      languages: user.languages,
      ageRange: user.ageRange ?? '',
      hostCities: user.hostCities,
      bio: user.bio ?? '',
    };

    const textForEmbedding = `
      World Cup fan from ${embeddingInput.nationality} supporting ${embeddingInput.supportedTeam}.
      Visiting cities: ${embeddingInput.hostCities.join(', ')}.
      Speaks: ${embeddingInput.languages.join(', ')}.
      Interests: ${embeddingInput.interests.join(', ')}.
      Age group: ${embeddingInput.ageRange}.
      ${embeddingInput.bio}
    `.trim();

    const embedding = await this.openai.generateEmbedding(textForEmbedding);

    // Store in Pinecone with metadata for filtering
    await this.pinecone.upsertVector(userId, embedding, {
      userId,
      nationality: user.nationality,
      supportedTeam: user.supportedTeam,
      hostCities: user.hostCities,
      languages: user.languages,
      ageRange: user.ageRange,
      lastActiveAt: user.lastActiveAt?.toISOString(),
    });

    // Update embedding version in DB
    await this.prisma.user.update({
      where: { id: userId },
      data: { embeddingVersion: { increment: 1 } },
    });
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async getExcludedUserIds(userId: string): Promise<string[]> {
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId, status: { in: ['declined', 'blocked'] } },
          { receiverId: userId, status: 'blocked' },
        ],
      },
      select: { senderId: true, receiverId: true },
    });

    return connections.map(c => (c.senderId === userId ? c.receiverId : c.senderId));
  }

  private sanitizeUserForMatch(user: User): Partial<User> {
    // Only return safe public fields
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      nationality: user.nationality,
      countryFlag: user.countryFlag,
      supportedTeam: user.supportedTeam,
      ageRange: user.ageRange,
      languages: user.languages,
      interests: user.interests,
      hostCities: user.hostCities,
      isVerified: user.isVerified,
      trustLevel: user.trustLevel,
    };
  }
}
