import { PrismaService } from '../prisma/prisma.service';
export declare class AiService {
    private prisma;
    constructor(prisma: PrismaService);
    coach(userId: string, action: string, data?: any): Promise<{
        response: string;
    }>;
}
