import { HabitsService } from './habits.service';
export declare class HabitsController {
    private habitsService;
    constructor(habitsService: HabitsService);
    findAll(userId: string): Promise<any[]>;
    create(userId: string, body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
