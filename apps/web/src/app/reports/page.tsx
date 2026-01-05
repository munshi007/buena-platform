import styles from './reports.module.css';
import { StatsCards } from '@/components/reports/StatsCards';
import { DistributionChart } from '@/components/reports/DistributionChart';
import { AiSummary } from '@/components/reports/AiSummary';
import { AlertCircle } from 'lucide-react';

async function getReportStats() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/reports/stats`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export default async function ReportsPage() {
    const stats = await getReportStats();

    if (!stats) {
        return (
            <div className={styles.container} suppressHydrationWarning>
                <h1 className={styles.title}>Reports</h1>
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className={styles.errorTitle}>Unable to load reports</h3>
                        <p className={styles.errorMessage}>Please check your connection or try again later.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare chart data with safety defaults
    const unitTypeData = (stats.unitTypeSplit || []).map((item: any) => ({
        label: item.type,
        count: item.count,
        color: item.type === 'APARTMENT' ? '#4f46e5' :
            item.type === 'OFFICE' ? '#0ea5e9' :
                item.type === 'PARKING' ? '#64748b' : '#10b981'
    })).sort((a: any, b: any) => b.count - a.count);

    const managementData = (stats.managementSplit || []).map((item: any) => ({
        label: item.type === 'WEG' ? 'WEG (Condo Association)' : 'MV (Rental Management)',
        count: item.count,
        color: item.type === 'WEG' ? '#8b5cf6' : '#f59e0b'
    }));

    const documentData = (stats.documentSplit || []).map((item: any) => ({
        label: item.kind?.replace(/_/g, ' ') || 'Unknown',
        count: item.count,
        color: '#6366f1'
    })).sort((a: any, b: any) => b.count - a.count);

    const financials = stats.financials || { income: 0, expenses: 0, net: 0 };
    const financialData = [
        { label: 'Total Revenue', count: financials.income, color: '#10b981' },
        { label: 'Total Expenses', count: financials.expenses, color: '#ef4444' }
    ];

    return (
        <div className={styles.container} suppressHydrationWarning>
            <div className={styles.header}>
                <h1 className={styles.title}>Reports</h1>
                <p className={styles.subtitle}>Detailed analysis and performance metrics.</p>
            </div>

            <StatsCards stats={stats} />

            <div className={styles.grid}>
                <DistributionChart
                    title="Unit Type Distribution"
                    data={unitTypeData}
                    total={stats.totalUnits || 0}
                />
                <DistributionChart
                    title="Financial Performance (€)"
                    data={financialData}
                    total={financials.income + financials.expenses}
                    hidePercentage
                />
            </div>

            <div className={styles.grid} style={{ marginTop: '2rem' }}>
                <DistributionChart
                    title="Management Structure"
                    data={managementData}
                    total={stats.totalProperties || 0}
                />
                <DistributionChart
                    title="Document Composition"
                    data={documentData}
                    total={documentData.reduce((acc: number, d: any) => acc + d.count, 0)}
                />
            </div>

            <AiSummary />
        </div>
    );
}
