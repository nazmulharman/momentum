import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { HabitsService } from './habits.service';

@Controller('habits')
export class HabitsController {
  constructor(private habitsService: HabitsService) {}

  @Get()
  async findAll(@Query('userId') userId: string) {
    const id = userId || 'default-user-nazmul';
    return this.habitsService.findAll(id);
  }

  @Post()
  async create(@Query('userId') userId: string, @Body() body: any) {
    const id = userId || 'default-user-nazmul';
    return this.habitsService.create(id, body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.habitsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.habitsService.remove(id);
  }
}
