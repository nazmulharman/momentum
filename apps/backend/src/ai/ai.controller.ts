import { Controller, Post, Body, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('coach')
  async coach(
    @Query('userId') userId: string,
    @Body() body: { action: string; data?: any }
  ) {
    const id = userId || 'default-user-nazmul';
    return this.aiService.coach(id, body.action, body.data);
  }
}
