interface DistributionChartProps {
    title: string;
    data: { label: string; count: number; color?: string }[];
    total: number;
    hidePercentage?: boolean;
}

export function DistributionChart({ title, data, total, hidePercentage }: DistributionChartProps) {
    return (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
        }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>{title}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.map((item) => {
                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                    return (
                        <div key={item.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem' }}>
                                <span style={{ fontWeight: 500, color: '#475569' }}>
                                    {item.label}
                                </span>
                                <span style={{ color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                                    {item.count.toLocaleString()} {!hidePercentage && <span style={{ color: '#94a3b8', marginLeft: '4px' }}>({Math.round(percentage)}%)</span>}
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '6px',
                                background: '#f1f5f9',
                                borderRadius: '3px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: item.color || '#3b82f6',
                                    borderRadius: '3px',
                                    transition: 'width 0.5s ease-out'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
