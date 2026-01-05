import { client } from '@/lib/client';
import Link from 'next/link';
import PropertyDetailsClient from '@/components/properties/PropertyDetailsClient';

export default async function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // @ts-ignore
    const { data } = await client.GET('/properties');
    const properties = (data as unknown as any[]) || [];
    const property = properties.find((p: any) => p.id === id);

    if (!property) return <div>Property not found</div>;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
            <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                &larr; Back to Dashboard
            </Link>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{property.propertyNumber}</span>
                            <span style={{ background: '#e0f2fe', padding: '0.25rem 0.5rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, color: '#0369a1' }}>{property.managementType}</span>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{property.name}</h1>
                    </div>
                    <Link href={`/properties/${property.id}/settings`} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
                        Edit Property
                    </Link>
                </div>

                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
                    <div>
                        <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '1rem' }}>Buildings ({property.buildings?.length})</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {property.buildings?.map((b: any, i: number) => (
                                <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontWeight: 600, color: '#334155' }}>{b.street} {b.houseNumber}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{b.zipMode} {b.city}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <PropertyDetailsClient property={property} />
                    </div>
                </div>
            </div>
        </div>
    );
}
