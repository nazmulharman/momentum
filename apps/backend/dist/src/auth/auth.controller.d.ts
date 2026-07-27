import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        message: string;
        token: string;
        user: any;
    }>;
    getUser(email: string): Promise<any>;
}
