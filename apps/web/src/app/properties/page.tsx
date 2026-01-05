import { client } from '@/lib/client';
import Link from 'next/link';
import PropertiesList from '@/components/properties/PropertiesList';

export default async function PropertiesPage() {
    // @ts-ignore
    const { data } = await client.GET('/properties');
    const properties = (data as unknown as any[]) || [];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>All Properties</h1>
                    <p style={{ color: '#64748b' }}>Manage your real estate portfolio.</p>
                </div>
                <Link href="/create" style={{ display: 'inline-flex', alignItems: 'center', background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 500, textDecoration: 'none' }}>
                    + Create Property
                </Link>
            </div>

            {properties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏢</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>No properties found</h3>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Get started by creating your first property.</p>
                    <Link href="/create" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Create Property &rarr;</Link>
                </div>
            ) : (
                <PropertiesList initialProperties={properties} />
            )}
        </div>
    );
}
