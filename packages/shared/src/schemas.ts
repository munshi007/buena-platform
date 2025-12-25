import { z } from 'zod';
import { ManagementType, UnitType, PropertyStatus } from './enums';

export const addressSchema = z.object({
    street: z.string().min(1),
    houseNumber: z.string().min(1),
    zipMode: z.string().optional(),
    city: z.string().optional(),
});

export const buildingSchema = addressSchema.extend({
    tempId: z.string().min(1), // Client-side ID for mapping units
});

export const createUnitSchema = z.object({
    buildingTempId: z.string().min(1),
    number: z.string().min(1),
    type: z.nativeEnum(UnitType),
    floor: z.string().optional(),
    entrance: z.string().optional(),
    size: z.number().min(0),
    coOwnershipShare: z.number().min(0).max(1000), // e.g. 500/1000
    constructionYear: z.number().int().min(1800).max(2100).optional(),
    rooms: z.number().min(0).optional(),
});

export const generalInfoSchema = z.object({
    name: z.string().min(2),
    managementType: z.nativeEnum(ManagementType),
    managerId: z.string().optional(), // Mock ID
    accountantId: z.string().optional(), // Mock ID
    documentId: z.string().optional(),
    status: z.nativeEnum(PropertyStatus).optional(),
});

export const createPropertySchema = z.object({
    generalInfo: generalInfoSchema,
    buildings: z.array(buildingSchema),
    units: z.array(createUnitSchema),
});

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;
export type CreateUnitDto = z.infer<typeof createUnitSchema>;
export type CreateBuildingDto = z.infer<typeof buildingSchema>;
