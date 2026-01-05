import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantDto } from '@buena/shared';

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tenant.findMany({
            include: {
                leases: {
                    include: {
                        unit: {
                            include: {
                                property: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                leases: {
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        },
                    },
                },
            },
        });
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant;
    }

    async create(dto: TenantDto) {
        return this.prisma.tenant.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
            },
        });
    }

    async update(id: string, dto: Partial<TenantDto>) {
        return this.prisma.tenant.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        return this.prisma.tenant.delete({
            where: { id },
        });
    }
}
