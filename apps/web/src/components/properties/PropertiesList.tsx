'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DeletePropertyButton from '@/components/dashboard/DeletePropertyButton';

type Property = {
    id: string;
    propertyNumber: string;
    name: string;
    status: 'ACTIVE' | 'DRAFT';
    managementType: 'WEG' | 'MV';
    buildings: any[];
    units: any[];
};

export default function PropertiesList({ initialProperties }: { initialProperties: Property[] }) {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'WEG' | 'MV'>('ALL');
    const [minUnits, setMinUnits] = useState<number>(0);
    const [minSize, setMinSize] = useState<number>(0);
    const [presets, setPresets] = useState<{ name: string, filters: any }[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Property | 'unitsCount' | 'buildingsCount', direction: 'asc' | 'desc' } | null>(null);

    // Load presets from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('property-filter-presets');
        if (saved) setPresets(JSON.parse(saved));
    }, []);

    const savePreset = () => {
        const name = window.prompt("Enter preset name:");
        if (!name) return;
        const newPresets = [...presets, { name, filters: { filterType, minUnits, minSize } }];
        setPresets(newPresets);
        localStorage.setItem('property-filter-presets', JSON.stringify(newPresets));
    };

    const applyPreset = (preset: any) => {
        setFilterType(preset.filters.filterType);
        setMinUnits(preset.filters.minUnits);
        setMinSize(preset.filters.minSize);
    };

    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    // Controlled by internal state OR URL param (if present on mount/update)
    const [activeTab, setActiveTab] = useState<'active' | 'draft'>(
        tabParam === 'draft' ? 'draft' : 'active'
    );

    // Effect to sync URL param to state if it changes externally
    useEffect(() => {
        if (tabParam === 'draft') setActiveTab('draft');
        else if (tabParam === 'active') setActiveTab('active');
    }, [tabParam]);

    const filteredProperties = useMemo(() => {
        let result = [...initialProperties];

        // 1. Filter by Status (Tab)
        if (activeTab === 'active') {
            result = result.filter(p => p.status !== 'DRAFT');
        } else {
            result = result.filter(p => p.status === 'DRAFT');
        }

        // 2. Filter by Management Type
        if (filterType !== 'ALL') {
            result = result.filter(p => p.managementType === filterType);
        }

        // 3. Filter by Min Units
        if (minUnits > 0) {
            result = result.filter(p => (p.units?.length || 0) >= minUnits);
        }

        // 4. Filter by Min Size
        if (minSize > 0) {
            result = result.filter(p => {
                const totalSize = p.units?.reduce((sum: number, u: any) => sum + (Number(u.size) || 0), 0) || 0;
                return totalSize >= minSize;
            });
        }

        // 5. Filter by Search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.propertyNumber.toLowerCase().includes(q)
            );
        }

        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: any = sortConfig.key === 'unitsCount' ? (a.units?.length || 0) :
                    sortConfig.key === 'buildingsCount' ? (a.buildings?.length || 0) :
                        (a as any)[sortConfig.key];
                let bValue: any = sortConfig.key === 'unitsCount' ? (b.units?.length || 0) :
                    sortConfig.key === 'buildingsCount' ? (b.buildings?.length || 0) :
                        (b as any)[sortConfig.key];

                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [initialProperties, search, filterType, minUnits, minSize, sortConfig, activeTab]);

    const handleSort = (key: any) => {
        setSortConfig(current => {
            if (current && current.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const SortIcon = ({ colKey }: { colKey: any }) => {
        if (!sortConfig || sortConfig.key !== colKey) return <span style={{ opacity: 0.2, marginLeft: 4 }}>↕</span>;
        return <span style={{ marginLeft: 4 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div>
            {/* Tabs ... remains same ... */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('active')}
                    style={{
                        padding: '0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'active' ? '2px solid #4f46e5' : '2px solid transparent',
                        color: activeTab === 'active' ? '#4f46e5' : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    Active Properties
                </button>
                <button
                    onClick={() => setActiveTab('draft')}
                    style={{
                        padding: '0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'draft' ? '2px solid #4f46e5' : '2px solid transparent',
                        color: activeTab === 'draft' ? '#4f46e5' : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    Drafts
                </button>
            </div>

            {/* toolbar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 2,
                            minWidth: '250px',
                            padding: '0.625rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.875rem'
                        }}
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        style={{
                            flex: 1,
                            padding: '0.625rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">All Types</option>
                        <option value="WEG">WEG</option>
                        <option value="MV">MV</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Min Units:</span>
                        <input
                            type="number"
                            value={minUnits}
                            onChange={(e) => setMinUnits(Number(e.target.value))}
                            style={{ width: '60px', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Min Area (m²):</span>
                        <input
                            type="number"
                            value={minSize}
                            onChange={(e) => setMinSize(Number(e.target.value))}
                            style={{ width: '80px', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}
                        />
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {presets.length > 0 && (
                            <select
                                onChange={(e) => {
                                    const preset = presets.find(p => p.name === e.target.value);
                                    if (preset) applyPreset(preset);
                                }}
                                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', background: '#f8fafc' }}
                            >
                                <option value="">Auto-Filters...</option>
                                {presets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                            </select>
                        )}
                        <button
                            onClick={savePreset}
                            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Save View
                        </button>
                    </div>
                </div>
            </div>

            {filteredProperties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>No properties found</h3>
                    <p style={{ color: '#64748b' }}>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th onClick={() => handleSort('propertyNumber')} style={{ cursor: 'pointer', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                                    ID <SortIcon colKey="propertyNumber" />
                                </th>
                                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                                    Name <SortIcon colKey="name" />
                                </th>
                                <th onClick={() => handleSort('managementType')} style={{ cursor: 'pointer', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                                    Type <SortIcon colKey="managementType" />
                                </th>
                                <th onClick={() => handleSort('buildingsCount')} style={{ cursor: 'pointer', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                                    Buildings <SortIcon colKey="buildingsCount" />
                                </th>
                                <th onClick={() => handleSort('unitsCount')} style={{ cursor: 'pointer', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                                    Units <SortIcon colKey="unitsCount" />
                                </th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProperties.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', fontFamily: 'monospace' }}>
                                            {p.propertyNumber}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>
                                        <Link href={`/properties/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.name}</Link>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                                                {p.managementType}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{p.buildings?.length || 0}</td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{p.units?.length || 0}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                            {p.status === 'DRAFT' ? (
                                                <Link href={`/create?draftId=${p.id}`} style={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                                                    Resume
                                                </Link>
                                            ) : (
                                                <Link href={`/properties/${p.id}`} style={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                                                    View
                                                </Link>
                                            )}
                                            <DeletePropertyButton id={p.id} name={p.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
