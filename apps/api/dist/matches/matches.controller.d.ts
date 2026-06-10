import { PrismaService } from '../prisma.service';
export declare class MatchesController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(city?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        city: string;
        externalId: string;
        homeTeam: string;
        awayTeam: string;
        homeTeamCode: string;
        awayTeamCode: string;
        homeScore: number | null;
        awayScore: number | null;
        stadium: string;
        citySlug: string;
        country: string;
        stage: import(".prisma/client").$Enums.MatchStage;
        kickoffAt: Date;
        isCompleted: boolean;
        metaData: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
