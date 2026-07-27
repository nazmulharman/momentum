"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
let PrismaService = class PrismaService {
    users = [
        {
            id: 'default-user-nazmul',
            email: 'nazmul@example.com',
            password: 'password123',
            name: 'Nazmul',
        },
    ];
    tasks = [
        { id: '1', title: 'Design Facebook Campaign', time: '10:00 AM', status: 'In Progress', progress: 65, category: 'Marketing', priority: 'High', userId: 'default-user-nazmul', createdAt: new Date() },
        { id: '2', title: 'Sync with Dev Team', time: '02:00 PM', status: 'Pending', progress: 0, category: 'Engineering', priority: 'Medium', userId: 'default-user-nazmul', createdAt: new Date() },
        { id: '3', title: 'Review Marketing Copy', time: '04:30 PM', status: 'Completed', progress: 100, category: 'Marketing', priority: 'Low', userId: 'default-user-nazmul', createdAt: new Date() },
    ];
    habits = [
        { id: 'h1', name: 'Drink Water', streak: 12, completedToday: false, goal: '5 cups daily', userId: 'default-user-nazmul', createdAt: new Date() },
        { id: 'h2', name: 'Read Book', streak: 5, completedToday: true, goal: '30 mins daily', userId: 'default-user-nazmul', createdAt: new Date() },
    ];
    projects = [
        { id: 'p1', name: 'Website Development', userId: 'default-user-nazmul', createdAt: new Date() },
        { id: 'p2', name: 'Marketing Campaign', userId: 'default-user-nazmul', createdAt: new Date() },
    ];
    async onModuleInit() { }
    async onModuleDestroy() { }
    get user() {
        return {
            count: async () => this.users.length,
            findUnique: async ({ where }) => this.users.find(u => u.email === where.email || u.id === where.id) || null,
            create: async ({ data }) => {
                const u = { id: data.id || 'u_' + Date.now(), ...data };
                this.users.push(u);
                return u;
            },
        };
    }
    get task() {
        return {
            findMany: async ({ where } = {}) => {
                if (where?.userId)
                    return this.tasks.filter(t => t.userId === where.userId);
                return this.tasks;
            },
            findUnique: async ({ where } = {}) => {
                return this.tasks.find(t => t.id === where.id) || null;
            },
            create: async ({ data }) => {
                const newTask = { id: Date.now().toString(), createdAt: new Date(), ...data };
                this.tasks.unshift(newTask);
                return newTask;
            },
            createMany: async ({ data }) => {
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        this.tasks.push({ id: Date.now().toString() + Math.random(), createdAt: new Date(), ...item });
                    });
                }
                return { count: data.length };
            },
            update: async ({ where, data }) => {
                const idx = this.tasks.findIndex(t => t.id === where.id);
                if (idx !== -1) {
                    this.tasks[idx] = { ...this.tasks[idx], ...data };
                    return this.tasks[idx];
                }
                return null;
            },
            delete: async ({ where }) => {
                const target = this.tasks.find(t => t.id === where.id);
                this.tasks = this.tasks.filter(t => t.id !== where.id);
                return target || null;
            },
        };
    }
    get habit() {
        return {
            findMany: async ({ where } = {}) => {
                if (where?.userId)
                    return this.habits.filter(h => h.userId === where.userId);
                return this.habits;
            },
            create: async ({ data }) => {
                const newHabit = { id: 'h_' + Date.now(), createdAt: new Date(), ...data };
                this.habits.unshift(newHabit);
                return newHabit;
            },
            createMany: async ({ data }) => {
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        this.habits.push({ id: 'h_' + Date.now() + Math.random(), createdAt: new Date(), ...item });
                    });
                }
                return { count: data.length };
            },
            update: async ({ where, data }) => {
                const idx = this.habits.findIndex(h => h.id === where.id);
                if (idx !== -1) {
                    this.habits[idx] = { ...this.habits[idx], ...data };
                    return this.habits[idx];
                }
                return null;
            },
            delete: async ({ where }) => {
                const target = this.habits.find(h => h.id === where.id);
                this.habits = this.habits.filter(h => h.id !== where.id);
                return target || null;
            },
        };
    }
    get project() {
        return {
            findMany: async ({ where } = {}) => {
                if (where?.userId)
                    return this.projects.filter(p => p.userId === where.userId);
                return this.projects;
            },
            create: async ({ data }) => {
                const newPrj = { id: data.id || 'p_' + Date.now(), createdAt: new Date(), ...data };
                this.projects.push(newPrj);
                return newPrj;
            },
        };
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map