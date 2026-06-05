import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

// ============================================================
// FANVERSE 2026 — AI MODERATION SERVICE
//
// Multi-layer safety system:
// 1. OpenAI Moderation API (primary)
// 2. Rule-based filters (keyword patterns, spam detection)
// 3. Risk scoring system per user
// 4. Automated actions (warn, mute, flag for review)
// ============================================================

export interface ModerationResult {
  blocked: boolean;     // Message should not be sent
  flagged: boolean;     // Message sent but flagged for review
  score: number;        // 0-1 risk score
  reason?: string;      // Why it was flagged/blocked
  categories?: string[]; // ["harassment", "spam"]
}

export interface UserRiskProfile {
  userId: string;
  riskScore: number;
  recentViolations: number;
  isWatched: boolean;
}

// Hard-block patterns (regex based, language-agnostic)
const BLOCK_PATTERNS = [
  // Scam patterns
  /send\s*(me\s*)?(your\s*)?bitcoin/i,
  /western\s*union/i,
  /money\s*transfer/i,
  /click\s*(here\s*)?for\s*(free|tickets)/i,
  // Explicit solicitation
  /escort\s*service/i,
  /only\s*fans\.com/i,
];

// Warn patterns (allow but flag)
const WARN_PATTERNS = [
  /crypto/i,
  /nft/i,
  /investment\s*opportunity/i,
  /dm\s*me/i,
  /whatsapp\s*me/i,
];

const SPAM_MAX_SAME_MESSAGE = 3; // Max same message in 5 min
const SPAM_MAX_MESSAGES_PER_MIN = 8;

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private openai: OpenAI;

  // In-memory spam tracking (use Redis in production)
  private messageHistory = new Map<string, { content: string; timestamp: number }[]>();

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  // ============================================================
  // MAIN: Check a message for moderation
  // ============================================================

  async checkMessage(content: string, userId: string): Promise<ModerationResult> {
    // Fast path: check rule-based patterns first (no API call)
    const ruleCheck = this.checkRulePatterns(content);
    if (ruleCheck.blocked) {
      await this.logViolation(userId, 'rule_block', content, ruleCheck);
      return ruleCheck;
    }

    // Spam detection
    const spamCheck = this.checkSpam(content, userId);
    if (spamCheck.blocked) {
      return spamCheck;
    }

    // Check user risk score — high-risk users get stricter moderation
    const userRisk = await this.getUserRiskScore(userId);
    const moderateAggressively = userRisk > 0.6;

    // OpenAI Moderation API
    try {
      const modResult = await this.openai.moderations.create({
        input: content,
        model: 'omni-moderation-latest',
      });

      const result = modResult.results[0];
      const maxScore = Math.max(...Object.values(result.category_scores as Record<string, number>));

      const flaggedCategories = Object.entries(result.category_scores as Record<string, number>)
        .filter(([, score]) => score > 0.5)
        .map(([cat]) => cat);

      if (result.flagged || (moderateAggressively && maxScore > 0.3)) {
        const isHardBlock = maxScore > 0.8 ||
          ['harassment/threatening', 'violence/graphic', 'sexual/minors'].some(
            cat => (result.category_scores as any)[cat] > 0.5,
          );

        if (isHardBlock) {
          await this.logViolation(userId, 'ai_block', content, {
            blocked: true,
            flagged: true,
            score: maxScore,
            categories: flaggedCategories,
          });

          // Auto-escalate risk score
          await this.incrementRiskScore(userId, 0.2);
        }

        return {
          blocked: isHardBlock,
          flagged: true,
          score: maxScore,
          reason: flaggedCategories[0],
          categories: flaggedCategories,
        };
      }

      return {
        blocked: false,
        flagged: ruleCheck.flagged,
        score: maxScore,
        categories: [],
      };

    } catch (error) {
      // If OpenAI moderation fails, fall through with rule-based result only
      this.logger.warn('OpenAI moderation API failed, using rule-based fallback');
      return ruleCheck;
    }
  }

  // ============================================================
  // PROFILE MODERATION
  // ============================================================

  async checkUserProfile(
    displayName: string,
    bio: string,
    userId: string,
  ): Promise<ModerationResult> {
    const combined = `${displayName} ${bio}`;

    const ruleCheck = this.checkRulePatterns(combined);
    if (ruleCheck.blocked) return ruleCheck;

    try {
      const modResult = await this.openai.moderations.create({
        input: combined,
      });

      const result = modResult.results[0];
      return {
        blocked: result.flagged,
        flagged: result.flagged,
        score: Math.max(...Object.values(result.category_scores as Record<string, number>)),
      };
    } catch {
      return { blocked: false, flagged: false, score: 0 };
    }
  }

  // ============================================================
  // FAKE PROFILE DETECTION
  // ============================================================

  async assessFakeProfileRisk(userId: string): Promise<number> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        sentConnections: true,
        groupMembers: true,
        meetupsCreated: true,
      },
    });

    let risk = 0;

    // New account signals
    const ageHours = (Date.now() - user.createdAt.getTime()) / 3600000;
    if (ageHours < 24) risk += 0.15;
    if (ageHours < 1) risk += 0.25;

    // Missing profile data
    if (!user.nationality) risk += 0.1;
    if (!user.supportedTeam) risk += 0.1;
    if (!user.bio || user.bio.length < 20) risk += 0.1;
    if (!user.avatarUrl) risk += 0.1;

    // Suspicious activity patterns
    const connectionCount = user.sentConnections.length;
    if (ageHours < 24 && connectionCount > 50) risk += 0.3; // Mass connect
    if (ageHours < 1 && connectionCount > 10) risk += 0.4;  // Very rapid

    return Math.min(risk, 1);
  }

  // ============================================================
  // RISK SCORING
  // ============================================================

  async getUserRiskScore(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { riskScore: true },
    });
    return user?.riskScore ?? 0;
  }

  async incrementRiskScore(userId: string, delta: number): Promise<void> {
    const current = await this.getUserRiskScore(userId);
    const newScore = Math.min(current + delta, 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: { riskScore: newScore },
    });

    // Auto-ban if risk too high
    if (newScore >= 0.9) {
      await this.autoBanUser(userId, 'Risk score exceeded threshold');
    }
  }

  // ============================================================
  // RULE-BASED CHECKS
  // ============================================================

  private checkRulePatterns(content: string): ModerationResult {
    for (const pattern of BLOCK_PATTERNS) {
      if (pattern.test(content)) {
        return {
          blocked: true,
          flagged: true,
          score: 0.9,
          reason: 'spam_scam',
          categories: ['spam'],
        };
      }
    }

    for (const pattern of WARN_PATTERNS) {
      if (pattern.test(content)) {
        return {
          blocked: false,
          flagged: true,
          score: 0.4,
          reason: 'potential_spam',
          categories: ['spam'],
        };
      }
    }

    return { blocked: false, flagged: false, score: 0 };
  }

  private checkSpam(content: string, userId: string): ModerationResult {
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // 5 min

    if (!this.messageHistory.has(userId)) {
      this.messageHistory.set(userId, []);
    }

    const history = this.messageHistory.get(userId)!;

    // Clean old entries
    const recent = history.filter(m => now - m.timestamp < windowMs);
    this.messageHistory.set(userId, [...recent, { content, timestamp: now }]);

    // Check message rate
    const lastMin = recent.filter(m => now - m.timestamp < 60000);
    if (lastMin.length >= SPAM_MAX_MESSAGES_PER_MIN) {
      return {
        blocked: true,
        flagged: true,
        score: 0.8,
        reason: 'rate_limit',
        categories: ['spam'],
      };
    }

    // Check duplicate messages
    const sameMessages = recent.filter(m => m.content === content);
    if (sameMessages.length >= SPAM_MAX_SAME_MESSAGE) {
      return {
        blocked: true,
        flagged: true,
        score: 0.75,
        reason: 'duplicate_spam',
        categories: ['spam'],
      };
    }

    return { blocked: false, flagged: false, score: 0 };
  }

  // ============================================================
  // AUTOMATED ACTIONS
  // ============================================================

  private async autoBanUser(userId: string, reason: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason,
      },
    });

    await this.prisma.moderationLog.create({
      data: {
        userId,
        action: 'ban',
        reason,
        // moderatorId null = automated
      },
    });

    this.logger.warn(`Auto-banned user ${userId}: ${reason}`);
  }

  private async logViolation(
    userId: string,
    action: string,
    content: string,
    result: Partial<ModerationResult>,
  ): Promise<void> {
    await this.prisma.moderationLog.create({
      data: {
        userId,
        action,
        reason: result.reason,
        metadata: {
          content: content.substring(0, 200),
          score: result.score,
          categories: result.categories,
        },
      },
    });
  }
}
