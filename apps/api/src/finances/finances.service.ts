import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionDto, TransactionType } from '@buena/shared';

@Injectable()
export class FinancesService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const transactions = await this.prisma.transaction.findMany();

        let revenue = 0;
        let expenses = 0;

        transactions.forEach(t => {
            const amount = Number(t.amount);
            if (t.type === TransactionType.REVENUE) {
                revenue += amount;
            } else {
                expenses += amount;
            }
        });

        return {
            revenue,
            expenses,
            netProfit: revenue - expenses,
            transactionCount: transactions.length,
        };
    }

    async findAll(propertyId?: string) {
        return this.prisma.transaction.findMany({
            where: propertyId ? { propertyId } : {},
            orderBy: { date: 'desc' },
            include: { property: true },
        });
    }

    async create(dto: TransactionDto) {
        return this.prisma.transaction.create({
            data: {
                propertyId: dto.propertyId,
                unitId: dto.unitId,
                amount: dto.amount,
                type: dto.type as any,
                category: dto.category as any,
                date: dto.date,
                description: dto.description,
            },
        });
    }

    async update(id: string, dto: Partial<TransactionDto>) {
        return this.prisma.transaction.update({
            where: { id },
            data: {
                propertyId: dto.propertyId,
                unitId: dto.unitId,
                amount: dto.amount,
                type: dto.type as any,
                category: dto.category as any,
                date: dto.date,
                description: dto.description,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.transaction.delete({
            where: { id },
        });
    }
}
