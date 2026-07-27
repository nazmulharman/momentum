"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
            await this.prisma.habit.createMany({
                data: [
                    { name: 'Drink Water', streak: 12, completedToday: false, goal: '5 cups', current: 4, userId: user.id },
                    { name: 'Read Book', streak: 5, completedToday: true, goal: '30 mins', current: 1, userId: user.id },
                    { name: 'Exercise', streak: 3, completedToday: false, goal: '1 hr', current: 0, userId: user.id },
                ],
            });
            const project = await this.prisma.project.create({
                data: {
                    id: 'default-project-web',
                    name: 'Website Development',
                    userId: user.id,
                },
            });
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
    async validateUser(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (user) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map