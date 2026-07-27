import { TasksService } from './tasks.service';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    findAll(userId: string): Promise<any[]>;
    findAllProjects(userId: string): Promise<any[]>;
    createProject(userId: string, body: {
        name: string;
    }): Promise<any>;
    findOne(id: string): Promise<any>;
    create(userId: string, body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
