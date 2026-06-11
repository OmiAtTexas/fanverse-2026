import { PrismaService } from '../prisma.service';
export declare class MessagesController {
    private prisma;
    constructor(prisma: PrismaService);
    getConversations(clerkId: string): Promise<{
        id: string;
        lastMessage: string;
        lastMessageAt: Date;
        other: {
            id: string;
            clerkId: string;
            displayName: string;
            avatarUrl: string;
            supportedTeam: string;
        };
    }[]>;
    getMessages(conversationId: string): Promise<({
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
    sendDM(toClerkId: string, fromClerkId: string, body: any): Promise<{
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
}
