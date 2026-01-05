'use client';

import { useState } from 'react';
import DocumentsTab from './DocumentsTab';

export default function PropertyDetailsClient({ property }: { property: any }) {
    const [activeTab, setActiveTab] = useState<'units' | 'documents'>('units');

    return (
        <div>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('units')}
                    style={{
                        padding: '0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'units' ? '2px solid #4f46e5' : '2px solid transparent',
                        color: activeTab === 'units' ? '#4f46e5' : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    Units ({property.units?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    style={{
                        padding: '0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'documents' ? '2px solid #4f46e5' : '2px solid transparent',
                        color: activeTab === 'documents' ? '#4f46e5' : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    Document Center ({property.documents?.length || 0})
                </button>
            </div>

            {activeTab === 'units' ? (
                <div style={{ maxHeight: 600, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Tenant / Status</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {property.units?.map((u: any, i: number) => {
                                const activeLease = u.leases?.find((l: any) => l.status === 'ACTIVE');
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem' }}>{u.number}</td>
                                        <td style={{ padding: '0.75rem' }}>{u.type}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {activeLease ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                                                    <span style={{ fontWeight: 500 }}>{activeLease.tenant.firstName} {activeLease.tenant.lastName}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>VACANT</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{u.size} m²</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <DocumentsTab propertyId={property.id} initialDocuments={property.documents} />
            )}
        </div>
    );
}
