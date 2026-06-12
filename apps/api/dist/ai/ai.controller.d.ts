import { PrismaService } from '../prisma.service';
export declare class AiController {
    private prisma;
    constructor(prisma: PrismaService);
    private matchCache;
    private cacheTime;
    private getAllMatches;
    getHistory(clerkId: string): Promise<{
        id: string;
        clerkId: string;
        role: string;
        createdAt: Date;
        content: string;
    }[]>;
    clearHistory(clerkId: string): Promise<{
        success: boolean;
    }>;
    chat(body: {
        message: string;
        history?: {
            role: string;
            content: string;
        }[];
    }, clerkId: string): Promise<{
        reply: any;
    }>;
}
