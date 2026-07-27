import { PrismaService } from '../prisma/prisma.service';
export declare class HabitsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<any[]>;
    create(userId: string, data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
}
