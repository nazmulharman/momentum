import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(@Query('userId') userId: string) {
    const id = userId || 'default-user-nazmul';
    return this.tasksService.findAll(id);
  }

  @Get('projects')
  async findAllProjects(@Query('userId') userId: string) {
    const id = userId || 'default-user-nazmul';
    return this.tasksService.findAllProjects(id);
  }

  @Post('projects')
  async createProject(@Query('userId') userId: string, @Body() body: { name: string }) {
    const id = userId || 'default-user-nazmul';
    return this.tasksService.createProject(id, body.name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  async create(@Query('userId') userId: string, @Body() body: any) {
    const id = userId || 'default-user-nazmul';
    return this.tasksService.create(id, body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
