import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private prisma;
    server: Server;
    private userSockets;
    constructor(prisma: PrismaService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    joinGroup(data: {
        groupId: string;
    }, client: Socket): Promise<void>;
    sendGroupMessage(data: {
        groupId: string;
        content: string;
        clerkId: string;
    }): Promise<void>;
    sendDM(data: {
        toClerkId: string;
        content: string;
        fromClerkId: string;
    }): Promise<void>;
}
