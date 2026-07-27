import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.habit.create({
      data: {
        name: data.name,
        streak: data.streak || 0,
        completedToday: data.completedToday || false,
        goal: data.goal,
        current: data.current || 0,
        userId: userId,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.habit.update({
      where: { id },
      data: {
        name: data.name,
        streak: data.streak,
        completedToday: data.completedToday,
        goal: data.goal,
        current: data.current,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.habit.delete({
      where: { id },
    });
  }
}
