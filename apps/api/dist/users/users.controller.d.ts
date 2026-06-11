import { PrismaService } from '../prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    search(q: string, clerkId: string): Promise<{
        id: string;
        clerkId: string;
        username: string;
        displayName: string;
        avatarUrl: string;
        bio: string;
        nationality: string;
        supportedTeam: string;
    }[]>;
    suggestions(clerkId: string): Promise<{
        id: string;
        clerkId: string;
        username: string;
        displayName: string;
        avatarUrl: string;
        bio: string;
        nationality: string;
        supportedTeam: string;
    }[]>;
    getProfile(id: string): Promise<{
        id: string;
        clerkId: string;
        username: string;
        displayName: string;
        avatarUrl: string;
        bio: string;
        nationality: string;
        supportedTeam: string;
    }>;
    follow(targetId: string, clerkId: string): Promise<{
        following: boolean;
    }>;
}
