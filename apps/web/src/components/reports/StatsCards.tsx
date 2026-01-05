import { Building2, DoorOpen, Layers, Ruler, Users, FileText, PiggyBank } from 'lucide-react';

interface StatsProps {
    stats: any;
}

export function StatsCards({ stats }: StatsProps) {
    if (!stats) return null;

    const cards = [
        { label: 'Total Properties', value: stats.totalProperties, icon: Building2 },
        { label: 'Total Units', value: stats.totalUnits, icon: DoorOpen },
        { label: 'Avg Unit Size (m²)', value: stats.averageUnitSize, icon: Ruler },
        { label: 'Total Tenants', value: stats.totalTenants || 0, icon: Users },
        { label: 'Occupancy Rate', value: `${stats.occupancyRate || 0}%`, icon: FileText },
        { label: 'Portfolio Value', value: '€' + (stats.financials?.net?.toLocaleString() || '0'), icon: PiggyBank },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {cards.map((card) => (
                <div key={card.label} style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                        <card.icon size={20} strokeWidth={1.5} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{card.label}</span>
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1 }}>
                        {card.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
