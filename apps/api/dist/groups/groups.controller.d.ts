import { PrismaService } from '../prisma.service';
export declare class GroupsController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(city?: string): Promise<{
        id: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        citySlug: string | null;
        country: string | null;
        description: string | null;
        slug: string;
        emoji: string | null;
        imageUrl: string | null;
        teamCode: string | null;
        matchId: string | null;
        tags: string[];
        isPublic: boolean;
        maxMembers: number;
        ownerId: string;
        healthScore: number;
    }[]>;
}
