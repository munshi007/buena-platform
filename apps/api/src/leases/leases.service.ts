import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaseDto } from '@buena/shared';

@Injectable()
export class LeasesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.lease.findMany({
            include: {
                unit: {
                    include: {
                        property: true,
                    },
                },
                tenant: true,
            },
            orderBy: { startDate: 'desc' },
        });
    }

    async findOne(id: string) {
        const lease = await this.prisma.lease.findUnique({
            where: { id },
            include: {
                unit: true,
                tenant: true,
            },
        });
        if (!lease) throw new NotFoundException('Lease not found');
        return lease;
    }

    async create(dto: CreateLeaseDto) {
        return this.prisma.lease.create({
            data: {
                unitId: dto.unitId,
                tenantId: dto.tenantId,
                startDate: dto.startDate,
                endDate: dto.endDate,
                rentAmount: dto.rentAmount,
                depositAmount: dto.depositAmount,
                status: dto.status,
            },
        });
    }

    async update(id: string, dto: Partial<CreateLeaseDto>) {
        return this.prisma.lease.update({
            where: { id },
            data: dto as any, // Cast due to internal decimal representation vs dto number
        });
    }

    async remove(id: string) {
        return this.prisma.lease.delete({
            where: { id },
        });
    }
}
