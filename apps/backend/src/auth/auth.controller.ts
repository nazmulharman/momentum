import { Controller, Post, Body, UnauthorizedException, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      message: 'Login successful',
      token: 'mock-jwt-token-for-' + user.id,
      user,
    };
  }

  @Get('user')
  async getUser(@Query('email') email: string) {
    const user = await this.authService.validateUser(email || 'nazmul@example.com');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
