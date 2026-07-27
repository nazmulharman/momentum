import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const userCount = await this.prisma.user.count();
    if (userCount === 0) {
      console.log('Seeding default user: Nazmul...');
      const user = await this.prisma.user.create({
        data: {
          id: 'default-user-nazmul',
          email: 'nazmul@example.com',
          password: 'password123',
          name: 'Nazmul',
        },
      });

      // Seed Tasks
      await this.prisma.task.createMany({
        data: [
          {
            title: 'Design Facebook Campaign',
            priority: 'High',
            category: 'Marketing',
            status: 'In Progress',
            progress: 65,
            userId: user.id,
            estimatedTime: 2.0,
            actualTime: 1.3,
          },
          {
            title: 'Sync with Dev Team',
            priority: 'Medium',
            category: 'Engineering',
            status: 'Pending',
            progress: 0,
            userId: user.id,
            estimatedTime: 1.0,
          },
          {
            title: 'Review Marketing Copy',
            priority: 'Low',
            category: 'Marketing',
            status: 'Completed',
            progress: 100,
            userId: user.id,
            estimatedTime: 1.5,
            actualTime: 1.5,
          },
        ],
      });

      // Seed Habits
      await this.prisma.habit.createMany({
        data: [
          { name: 'Drink Water', streak: 12, completedToday: false, goal: '5 cups', current: 4, userId: user.id },
          { name: 'Read Book', streak: 5, completedToday: true, goal: '30 mins', current: 1, userId: user.id },
          { name: 'Exercise', streak: 3, completedToday: false, goal: '1 hr', current: 0, userId: user.id },
        ],
      });

      // Seed Projects
      const project = await this.prisma.project.create({
        data: {
          id: 'default-project-web',
          name: 'Website Development',
          userId: user.id,
        },
      });

      // Connect task to project
      await this.prisma.task.create({
        data: {
          title: 'Design Figma Landing Page Wireframe',
          priority: 'High',
          category: 'Design',
          status: 'Pending',
          progress: 0,
          userId: user.id,
          projectId: project.id,
          estimatedTime: 4.0,
        },
      });

      console.log('Seeding completed successfully!');
    }
  }

  async validateUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
