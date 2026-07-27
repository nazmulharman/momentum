import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async coach(userId: string, action: string, data?: any) {
    const id = userId || 'default-user-nazmul';
    
    const tasks = await this.prisma.task.findMany({ where: { userId: id } });
    const habits = await this.prisma.habit.findMany({ where: { userId: id } });

    switch (action) {
      case 'plan': {
        const activeTasks = tasks.filter(t => t.status !== 'Completed');
        const taskLines = activeTasks
          .slice(0, 3)
          .map(t => `  - **${t.title}** (${t.priority} priority, Est: ${t.estimatedTime || 1}h)`)
          .join('\n');
        return {
          response: `📅 **Personalized Daily Planner for Nazmul:**\n\n` +
            `Here is your optimized routine today, balancing focus blocks with regular habits:\n\n` +
            `• **09:00 AM - 09:30 AM:** Morning Planning & Water check\n` +
            `• **09:30 AM - 12:00 PM:** **Deep Work Block:**\n${taskLines || '  - (No pending tasks, add some!)'}\n` +
            `• **12:00 PM - 01:00 PM:** Break / Walk (Habit: Exercise)\n` +
            `• **02:00 PM - 03:00 PM:** Collaboration & Team Syncs\n` +
            `• **04:30 PM - 05:00 PM:** Daily Reflection & Log progress`
        };
      }
      case 'prioritize': {
        const activeTasks = tasks.filter(t => t.status !== 'Completed');
        const sorted = [...activeTasks].sort((a, b) => {
          const priorities = { High: 3, Medium: 2, Low: 1 };
          return (priorities[b.priority] || 0) - (priorities[a.priority] || 0);
        });
        const rankedLines = sorted
          .map((t, idx) => `${idx + 1}. **${t.title}** [${t.priority}] - Estimated: ${t.estimatedTime || 1} hours.`)
          .join('\n');
        return {
          response: `⚡ **Task Prioritization Matrix:**\n\n` +
            `I have analyzed your tasks and sorted them based on priority and effort:\n\n` +
            (rankedLines || 'No pending tasks to prioritize. Add some in your planner!')
        };
      }
      case 'breakdown': {
        const targetTitle = data?.taskTitle || (tasks[0]?.title || 'Design Facebook Campaign');
        return {
          response: `📋 **AI Breakdown for: "${targetTitle}"**\n\n` +
            `Here are the recommended subtasks to complete this objective:\n\n` +
            `• [ ] Step 1: Research specifications & competitor benchmarks (30m)\n` +
            `• [ ] Step 2: Create initial draft layout (1h 30m)\n` +
            `• [ ] Step 3: Align elements, fonts, and dark mode palette (1h)\n` +
            `• [ ] Step 4: Run visual validation & export assets (30m)`
        };
      }
      case 'review': {
        const completedCount = tasks.filter(t => t.status === 'Completed').length;
        const totalCount = tasks.length;
        const activeHabits = habits.map(h => `${h.name}: ${h.streak}d streak`).join(', ');
        return {
          response: `📊 **Weekly Review Summary:**\n\n` +
            `• **Task Completion:** You finished ${completedCount} out of ${totalCount} tasks in your log.\n` +
            `• **Habit Consistency:** Tracked streaks are going strong: ${activeHabits || 'No active habits'}.\n` +
            `• **Productivity Advice:** Your core focus block is currently set in the morning. Try scheduling code reviews in the afternoon to keep mornings clear for deep work.`
        };
      }
      default:
        return { response: 'Hello Nazmul! I am your AI Coach. How can I help you organize your productivity flow today?' };
    }
  }
}
