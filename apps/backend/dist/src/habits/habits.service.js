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
exports.HabitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HabitsService = class HabitsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.habit.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
    }
    async create(userId, data) {
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
    async update(id, data) {
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
    async remove(id) {
        return this.prisma.habit.delete({
            where: { id },
        });
    }
};
exports.HabitsService = HabitsService;
exports.HabitsService = HabitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HabitsService);
//# sourceMappingURL=habits.service.js.map