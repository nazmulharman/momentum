import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'Medium',
        category: data.category || 'General',
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: data.status || 'Pending',
        progress: data.progress || 0,
        estimatedTime: data.estimatedTime,
        actualTime: data.actualTime,
        projectId: data.projectId,
        userId: userId,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: data.status,
        progress: data.progress,
        estimatedTime: data.estimatedTime,
        actualTime: data.actualTime,
        projectId: data.projectId,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  // Projects CRUD
  async findAllProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async createProject(userId: string, name: string) {
    return this.prisma.project.create({
      data: {
        name,
        userId,
      },
    });
  }
}
