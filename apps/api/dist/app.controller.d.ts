import { PrismaService } from './prisma.service';
export declare class AppController {
    private prisma;
    constructor(prisma: PrismaService);
    health(): Promise<{
        status: string;
        users: number;
        timestamp: Date;
    }>;
}
