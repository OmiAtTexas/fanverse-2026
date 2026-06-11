import { PrismaService } from '../prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    private enrichUsers;
    search(q: string, clerkId: string): Promise<any[]>;
    suggestions(clerkId: string): Promise<any[]>;
    getFollowRequests(clerkId: string): Promise<({
        from: {
            id: string;
            clerkId: string;
            displayName: string;
            avatarUrl: string;
            nationality: string;
            supportedTeam: string;
        };
    } & {
        id: string;
        createdAt: Date;
        fromId: string;
        toId: string;
        status: string;
    })[]>;
    sendFollowRequest(targetId: string, clerkId: string): Promise<{
        id: string;
        createdAt: Date;
        fromId: string;
        toId: string;
        status: string;
    } | {
        status: string;
    }>;
    acceptFollowRequest(requestId: string, clerkId: string): Promise<{
        success: boolean;
    }>;
    declineFollowRequest(requestId: string): Promise<{
        success: boolean;
    }>;
    getConnections(clerkId: string): Promise<({
        sender: {
            id: string;
            clerkId: string;
            displayName: string;
            avatarUrl: string;
            supportedTeam: string;
        };
        receiver: {
            id: string;
            clerkId: string;
            displayName: string;
            avatarUrl: string;
            supportedTeam: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        status: string;
        receiverId: string;
        matchScore: number;
        matchReasons: import("@prisma/client/runtime/library").JsonValue | null;
        icebreaker: string | null;
    })[]>;
    getConnection(id: string): Promise<{
        sender: {
            id: string;
            clerkId: string;
            displayName: string;
            avatarUrl: string;
            nationality: string;
            supportedTeam: string;
        };
        receiver: {
            id: string;
            clerkId: string;
            displayName: string;
            avatarUrl: string;
            nationality: string;
            supportedTeam: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        status: string;
        receiverId: string;
        matchScore: number;
        matchReasons: import("@prisma/client/runtime/library").JsonValue | null;
        icebreaker: string | null;
    }>;
    getProfile(id: string): Promise<{
        id: string;
        clerkId: string;
        username: string;
        displayName: string;
        avatarUrl: string;
        bio: string;
        nationality: string;
        supportedTeam: string;
        _count: {
            followers: number;
            following: number;
        };
    }>;
    updateMe(clerkId: string, body: any): Promise<{
        id: string;
        clerkId: string;
        email: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
        bio: string | null;
        nationality: string | null;
        countryFlag: string | null;
        supportedTeam: string | null;
        ageRange: string | null;
        hostCities: string[];
        travelDates: import("@prisma/client/runtime/library").JsonValue | null;
        languages: import(".prisma/client").$Enums.Language[];
        primaryLanguage: import(".prisma/client").$Enums.Language;
        interests: string[];
        role: import(".prisma/client").$Enums.UserRole;
        trustLevel: import(".prisma/client").$Enums.TrustLevel;
        riskScore: number;
        isVerified: boolean;
        isBanned: boolean;
        bannedAt: Date | null;
        bannedReason: string | null;
        isPremium: boolean;
        premiumUntil: Date | null;
        embeddingVersion: number;
        pushToken: string | null;
        notifSettings: import("@prisma/client/runtime/library").JsonValue | null;
        privacySettings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        lastActiveAt: Date | null;
    }>;
}
