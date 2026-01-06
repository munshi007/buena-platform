import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { PropertyStatus as PrismaPropertyStatus } from '@prisma/client';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UnitType, ManagementType, PropertyStatus } from '@buena/shared';
import { EmailService } from '../email/email.service';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) { }

  async findAll() {
    return this.prisma.property.findMany({
      include: {
        buildings: true,
        units: {
          include: {
            leases: {
              include: {
                tenant: true,
              },
            },
          },
        },
        documents: {
          include: {
            versions: {
              orderBy: { version: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        buildings: true,
        units: {
          include: {
            leases: {
              include: {
                tenant: true,
              },
            },
          },
        },
        documents: {
          include: {
            versions: {
              orderBy: { version: 'desc' },
            },
          },
        },
      },
    });
    if (!property) throw new BadRequestException('Property not found');
    return property;
  }

  async remove(id: string) {
    // Cascade delete handles related records (Buildings, Units, Documents)
    return this.prisma.property.delete({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    console.log('UPDATING_PROPERTY:', id, JSON.stringify(data));
    const { generalInfo, buildings, units } = data;
    const { name, managementType, managerId, accountantId, status } = generalInfo || data; // Fallback for direct flat data if any

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Core Property
      await tx.property.update({
        where: { id },
        data: {
          name,
          managementType,
          managerId,
          accountantId,
          status: (status as any)
        }
      });

      // 2. Handle Buildings (Update only for now, simple implementation)
      if (buildings && Array.isArray(buildings)) {
        for (const b of buildings) {
          if (b.id) {
            await tx.building.update({
              where: { id: b.id },
              data: {
                street: b.street,
                houseNumber: b.houseNumber,
                zipMode: b.zipMode,
                city: b.city
              }
            });
          } else {
            // Create new building
            await tx.building.create({
              data: {
                propertyId: id,
                street: b.street,
                houseNumber: b.houseNumber,
                zipMode: b.zipMode,
                city: b.city
              }
            });
          }
        }
      }

      // 3. Handle Units (Update only for now)
      if (units && Array.isArray(units)) {
        for (const u of units) {
          if (u.id) {
            await tx.unit.update({
              where: { id: u.id },
              data: {
                number: u.number,
                type: u.type,
                floor: u.floor,
                entrance: u.entrance,
                size: u.size,
                coOwnershipShare: u.coOwnershipShare,
                rooms: u.rooms
              }
            });
          }
          // New units logic omitted for brevity/safety unless explicitly added w/ buildingId mapping
        }
      }

      return this.findOne(id);
    });
  }

  async create(dto: CreatePropertyDto) {
    console.log('CREATING_PROPERTY:', JSON.stringify(dto));
    const { generalInfo, buildings, units } = dto;

    // Validate tempId uniqueness and mapping existence
    const buildingTempIds = new Set(buildings.map((b) => b.tempId));
    if (buildingTempIds.size !== buildings.length) {
      throw new BadRequestException('Building tempIds must be unique');
    }

    for (const unit of units) {
      if (!buildingTempIds.has(unit.buildingTempId)) {
        throw new BadRequestException(
          `Unit references unknown buildingTempId: ${unit.buildingTempId}`,
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Generate Property Number via Sequence
        const seqResult = await tx.$queryRaw<any[]>`SELECT nextval('property_number_seq') as val`;
        console.log('Sequence result:', seqResult);
        const seqVal = seqResult[0].val || seqResult[0].nextval;

        if (!seqVal) {
          throw new Error('Failed to generate property number sequence value');
        }

        // Pad to 6 digits
        const propertyNumber = `BT-${String(seqVal).padStart(6, '0')}`;
        console.log('Generated property number:', propertyNumber);

        // 2. Create Property
        const property = await tx.property.create({
          data: {
            name: generalInfo.name,
            managementType: generalInfo.managementType as ManagementType,
            managerId: generalInfo.managerId,
            accountantId: generalInfo.accountantId,
            propertyNumber,
            status: (generalInfo.status as any) || 'ACTIVE',
          },
        });

        // 3. Create Buildings & Map tempId -> realId
        const tempIdMap = new Map<string, string>(); // tempId -> realId

        for (const b of buildings) {
          const createdBuilding = await tx.building.create({
            data: {
              propertyId: property.id,
              street: b.street || '', // Use empty string if missing/null to satisfy potentially strict types or fallback
              houseNumber: b.houseNumber || '',
              zipMode: b.zipMode || null,
              city: b.city || null,
            },
          });
          tempIdMap.set(b.tempId, createdBuilding.id);
        }

        // 4. Create Units
        if (units.length > 0) {
          const unitsData = units.map(u => ({
            propertyId: property.id,
            buildingId: tempIdMap.get(u.buildingTempId)!,
            number: u.number || null, // Convert empty string to null to avoid unique violation
            type: u.type || null,
            floor: u.floor,
            entrance: u.entrance,
            size: u.size || 0,
            coOwnershipShare: u.coOwnershipShare || 0,
            constructionYear: u.constructionYear || null,
            rooms: u.rooms,
          }));

          await tx.unit.createMany({
            data: unitsData as any, // Cast as any because some fields are null but Prisma types might be stricter
          });
        }

        // Send email notification (non-blocking)
        this.emailService.sendPropertyCreatedNotification({
          propertyName: property.name,
          propertyNumber: property.propertyNumber,
          unitCount: units.length,
          buildingCount: buildings.length,
          recipient: 'manager@buena-platform.com', // TODO: Use actual user email
        }).catch(err => console.error('Email notification failed:', err));

        return property;
      });
    } catch (error) {
      console.error('PROPERTIES_CREATE_ERROR:', error);
      const message = (error as any).message || 'Unknown error';
      const stack = (error as any).stack;
      console.error('Stack:', stack);
      throw new InternalServerErrorException('Transaction failed: ' + message);
    }
  }
}
