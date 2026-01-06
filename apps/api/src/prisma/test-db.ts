import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('Checking database counts...');

        const properties = await prisma.property.count();
        const units = await prisma.unit.count();
        const tenants = await prisma.tenant.count();
        const leases = await prisma.lease.count({ where: { status: 'ACTIVE' } });
        const transactions = await prisma.transaction.count();
        const revenues = await prisma.transaction.count({ where: { type: 'REVENUE' } });
        const incomes = await prisma.transaction.count({ where: { type: 'INCOME' as any } });

        console.log('--- Database Status ---');
        console.log('Properties:', properties);
        console.log('Units:', units);
        console.log('Tenants:', tenants);
        console.log('Active Leases:', leases);
        console.log('Total Transactions:', transactions);
        console.log('REVENUE (Correct Enum):', revenues);
        console.log('INCOME (Incorrect Enum):', incomes);
        console.log('-----------------------');

    } catch (e) {
        console.error('Database check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
