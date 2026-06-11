import { PrismaService } from '../prisma.service';
export declare class GroupsController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(city?: string, search?: string): Promise<({
        _count: {
            members: number;
        };
    } & {
        id: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        emoji: string | null;
        imageUrl: string | null;
        citySlug: string | null;
        country: string | null;
        teamCode: string | null;
        matchId: string | null;
        tags: string[];
        isPublic: boolean;
        maxMembers: number;
        ownerId: string;
        healthScore: number;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            members: number;
        };
    } & {
        id: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        emoji: string | null;
        imageUrl: string | null;
        citySlug: string | null;
        country: string | null;
        teamCode: string | null;
        matchId: string | null;
        tags: string[];
        isPublic: boolean;
        maxMembers: number;
        ownerId: string;
        healthScore: number;
    }>;
    getMessages(id: string): Promise<({
        sender: {
            id: string;
            clerkId: string;
            displayName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MessageType;
        conversationId: string;
        senderId: string;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isDeleted: boolean;
        isFlagged: boolean;
        moderationScore: number | null;
        translations: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    sendMessage(id: string, clerkId: string, body: any): Promise<{
        sender: {
            id: string;
            clerkId: string;
            displayName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MessageType;
        conversationId: string;
        senderId: string;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isDeleted: boolean;
        isFlagged: boolean;
        moderationScore: number | null;
        translations: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    create(clerkId: string, body: any): Promise<{
        id: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        emoji: string | null;
        imageUrl: string | null;
        citySlug: string | null;
        country: string | null;
        teamCode: string | null;
        matchId: string | null;
        tags: string[];
        isPublic: boolean;
        maxMembers: number;
        ownerId: string;
        healthScore: number;
    }>;
    join(id: string, clerkId: string): Promise<{
        id: string;
        role: string;
        groupId: string;
        userId: string;
        joinedAt: Date;
        isMuted: boolean;
    } | {
        message: string;
    }>;
    leave(id: string, clerkId: string): Promise<{
        id: string;
        role: string;
        groupId: string;
        userId: string;
        joinedAt: Date;
        isMuted: boolean;
    }>;
}
