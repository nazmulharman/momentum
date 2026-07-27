import { PrismaService } from '../prisma/prisma.service';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(userId: string, data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
    findAllProjects(userId: string): Promise<any[]>;
    createProject(userId: string, name: string): Promise<any>;
}
