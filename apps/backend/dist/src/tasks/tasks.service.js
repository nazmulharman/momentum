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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.task.findUnique({
            where: { id },
        });
    }
    async create(userId, data) {
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
    async update(id, data) {
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
    async remove(id) {
        return this.prisma.task.delete({
            where: { id },
        });
    }
    async findAllProjects(userId) {
        return this.prisma.project.findMany({
            where: { userId },
            include: { _count: { select: { tasks: true } } },
        });
    }
    async createProject(userId, name) {
        return this.prisma.project.create({
            data: {
                name,
                userId,
            },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map