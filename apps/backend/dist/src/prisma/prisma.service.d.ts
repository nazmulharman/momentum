import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private users;
    private tasks;
    private habits;
    private projects;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get user(): {
        count: () => Promise<number>;
        findUnique: ({ where }: any) => Promise<any>;
        create: ({ data }: any) => Promise<any>;
    };
    get task(): {
        findMany: ({ where }?: any) => Promise<any[]>;
        findUnique: ({ where }?: any) => Promise<any>;
        create: ({ data }: any) => Promise<any>;
        createMany: ({ data }: any) => Promise<{
            count: any;
        }>;
        update: ({ where, data }: any) => Promise<any>;
        delete: ({ where }: any) => Promise<any>;
    };
    get habit(): {
        findMany: ({ where }?: any) => Promise<any[]>;
        create: ({ data }: any) => Promise<any>;
        createMany: ({ data }: any) => Promise<{
            count: any;
        }>;
        update: ({ where, data }: any) => Promise<any>;
        delete: ({ where }: any) => Promise<any>;
    };
    get project(): {
        findMany: ({ where }?: any) => Promise<any[]>;
        create: ({ data }: any) => Promise<any>;
    };
}
