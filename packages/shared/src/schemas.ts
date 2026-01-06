import { z } from 'zod';
import { ManagementType, UnitType, PropertyStatus, LeaseStatus, TransactionType, TransactionCategory } from './enums';

export const addressSchema = z.object({
    street: z.string().optional().or(z.literal('')),
    houseNumber: z.string().optional().or(z.literal('')),
    zipMode: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
});

export const buildingSchema = addressSchema.extend({
    tempId: z.string().min(1), // Client-side ID for mapping units
});

export const createUnitSchema = z.object({
    buildingTempId: z.string().min(1),
    number: z.string().optional().or(z.literal('')),
    type: z.string().optional().or(z.literal('')),
    floor: z.string().optional(),
    entrance: z.string().optional(),
    size: z.number().optional().or(z.literal(0)),
    coOwnershipShare: z.number().optional().or(z.literal(0)),
    constructionYear: z.number().int().optional().or(z.literal(0)),
    rooms: z.number().optional().or(z.literal(0)),
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

export const tenantSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
});

export const createLeaseSchema = z.object({
    unitId: z.string().uuid(),
    tenantId: z.string().uuid(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    rentAmount: z.number().positive(),
    depositAmount: z.number().nonnegative().optional(),
    status: z.nativeEnum(LeaseStatus).default(LeaseStatus.ACTIVE),
});

export const transactionSchema = z.object({
    id: z.string().optional(),
    propertyId: z.string().uuid(),
    unitId: z.string().uuid().optional(),
    amount: z.number(),
    type: z.nativeEnum(TransactionType),
    category: z.nativeEnum(TransactionCategory),
    date: z.coerce.date(),
    description: z.string().optional(),
});

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;
export type CreateUnitDto = z.infer<typeof createUnitSchema>;
export type CreateBuildingDto = z.infer<typeof buildingSchema>;
export type TenantDto = z.infer<typeof tenantSchema>;
export type CreateLeaseDto = z.infer<typeof createLeaseSchema>;
export type TransactionDto = z.infer<typeof transactionSchema>;
