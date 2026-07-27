import { AiService } from './ai.service';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    coach(userId: string, body: {
        action: string;
        data?: any;
    }): Promise<{
        response: string;
    }>;
}
