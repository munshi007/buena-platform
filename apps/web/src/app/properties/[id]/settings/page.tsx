'use client';
import { client } from '@/lib/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

// Reuse styles for simplicity or inline
const inputStyle = { width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.875rem' };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#64748b' };
const sectionTitleStyle = { fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', marginTop: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' };

export default function PropertySettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State
    const [general, setGeneral] = useState({ name: '', managementType: 'WEG', managerId: '', accountantId: '' });
    const [buildings, setBuildings] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);

    useEffect(() => {
        client.GET('/properties').then(({ data }) => {
            const matches = (data as unknown as any[])?.filter((p: any) => p.id === id);
            if (matches && matches.length > 0) {
                const p = matches[0];
                setGeneral({
                    name: p.name || '',
                    managementType: p.managementType || 'WEG',
                    managerId: p.managerId || '',
                    accountantId: p.accountantId || ''
                });
                setBuildings(p.buildings || []);
                setUnits(p.units || []);
            }
            setLoading(false);
        });
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // @ts-ignore
            const { error } = await client.PATCH(`/properties/${id}`, {
                body: {
                    ...general,
                    buildings,
                    units
                }
            });

            if (error) {
                alert('Failed to update property');
            } else {
                alert('Property updated successfully');
                router.refresh();
                router.push(`/properties/${id}`);
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    // Helper update functions
    const updateBuilding = (idx: number, field: string, val: string) => {
        const next = [...buildings];
        next[idx] = { ...next[idx], [field]: val };
        setBuildings(next);
    };

    const updateUnit = (idx: number, field: string, val: any) => {
        const next = [...units];
        next[idx] = { ...next[idx], [field]: val };
        setUnits(next);
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
            <Link href={`/properties/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
                &larr; Back to Property
            </Link>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Edit Property</h1>
                        <p style={{ color: '#64748b' }}>Update full details.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: '#0f172a', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* General Info */}
                <h3 style={sectionTitleStyle}>General Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Property Name</label>
                        <input value={general.name} onChange={e => setGeneral({ ...general, name: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Management Type</label>
                        <select value={general.managementType} onChange={e => setGeneral({ ...general, managementType: e.target.value })} style={inputStyle}>
                            <option value="WEG">WEG</option>
                            <option value="MV">MV</option>
                            <option value="SEV">SEV</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Manager ID</label>
                        <input value={general.managerId} onChange={e => setGeneral({ ...general, managerId: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Accountant ID</label>
                        <input value={general.accountantId} onChange={e => setGeneral({ ...general, accountantId: e.target.value })} style={inputStyle} />
                    </div>
                </div>

                {/* Buildings */}
                <h3 style={sectionTitleStyle}>Buildings ({buildings.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {buildings.map((b, i) => (
                        <div key={b.id || i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '1rem' }}>
                                <div><label style={labelStyle}>Street</label><input value={b.street} onChange={e => updateBuilding(i, 'street', e.target.value)} style={inputStyle} /></div>
                                <div><label style={labelStyle}>No.</label><input value={b.houseNumber} onChange={e => updateBuilding(i, 'houseNumber', e.target.value)} style={inputStyle} /></div>
                                <div><label style={labelStyle}>ZIP</label><input value={b.zipMode} onChange={e => updateBuilding(i, 'zipMode', e.target.value)} style={inputStyle} /></div>
                                <div><label style={labelStyle}>City</label><input value={b.city} onChange={e => updateBuilding(i, 'city', e.target.value)} style={inputStyle} /></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Units */}
                <h3 style={sectionTitleStyle}>Units ({units.length})</h3>
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, maxHeight: 500 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>#</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Type</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Size</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Share</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.map((u, i) => (
                                <tr key={u.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.5rem' }}><input value={u.number} onChange={e => updateUnit(i, 'number', e.target.value)} style={{ ...inputStyle, width: 60 }} /></td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <select value={u.type} onChange={e => updateUnit(i, 'type', e.target.value)} style={{ ...inputStyle, width: 100 }}>
                                            <option value="APARTMENT">Apt</option>
                                            <option value="OFFICE">Office</option>
                                            <option value="PARKING">Parking</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}><input type="number" value={u.size} onChange={e => updateUnit(i, 'size', parseFloat(e.target.value))} style={{ ...inputStyle, width: 80 }} /></td>
                                    <td style={{ padding: '0.5rem' }}><input type="number" value={u.coOwnershipShare} onChange={e => updateUnit(i, 'coOwnershipShare', parseFloat(e.target.value))} style={{ ...inputStyle, width: 80 }} /></td>
                                    <td style={{ padding: '0.5rem', color: '#94a3b8', fontStyle: 'italic' }}>-</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
