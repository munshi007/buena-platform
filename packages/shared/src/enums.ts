export enum ManagementType {
    WEG = 'WEG',
    MV = 'MV',
}

export enum UnitType {
    APARTMENT = 'APARTMENT',
    OFFICE = 'OFFICE',
    GARDEN = 'GARDEN',
    PARKING = 'PARKING',
    OTHER = 'OTHER',
}

export enum DocumentKind {
    TEILUNGSERKLAERUNG = 'TEILUNGSERKLAERUNG',
}

export enum PropertyStatus {
    ACTIVE = 'ACTIVE',
    DRAFT = 'DRAFT',
}

export enum LeaseStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    TERMINATED = 'TERMINATED',
}

export enum TransactionType {
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE',
}

export enum TransactionCategory {
    RENT = 'RENT',
    DEPOSIT = 'DEPOSIT',
    MAINTENANCE = 'MAINTENANCE',
    TAX = 'TAX',
    INSURANCE = 'INSURANCE',
    UTILITIES = 'UTILITIES',
    OTHER = 'OTHER',
}
