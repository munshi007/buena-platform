'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { client } from '@/lib/client';
import styles from '../../dashboard.module.css';
import {
    Mail,
    Phone,
    Calendar,
    Home,
    ArrowLeft,
    Edit,
    FileText,
    CheckCircle2,
    Plus,
    X
} from 'lucide-react';

const Modal = ({ title, children, onClose, onConfirm, confirmText = 'Save', isSubmitting = false }: any) => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '480px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                </div>
                <div style={{ marginBottom: '1.5rem', color: '#4b5563' }}>{children}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button onClick={onClose} style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                    <button onClick={onConfirm} disabled={isSubmitting} style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                        {isSubmitting ? 'Creating...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function TenantProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showLeaseModal, setShowLeaseModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lease Form State
    const [properties, setProperties] = useState<any[]>([]);
    const [leaseData, setLeaseData] = useState({
        unitId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        rentAmount: 0,
        depositAmount: 0
    });

    const fetchTenant = async () => {
        setLoading(true);
        try {
            const { data } = await client.GET('/tenants/{id}' as any, {
                params: { path: { id } }
            } as any);
            setTenant(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProperties = async () => {
        const { data } = await client.GET('/properties', {});
        setProperties((data as unknown as any[]) || []);
    };

    useEffect(() => {
        if (id) fetchTenant();
    }, [id]);

    useEffect(() => {
        if (showLeaseModal) fetchProperties();
    }, [showLeaseModal]);

    const handleCreateLease = async () => {
        if (!leaseData.unitId || !leaseData.rentAmount || !leaseData.startDate) {
            alert('Please fill in Unit, Rent, and Start Date');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await client.POST('/leases' as any, {
                body: {
                    ...leaseData,
                    tenantId: id,
                    rentAmount: Number(leaseData.rentAmount),
                    depositAmount: Number(leaseData.depositAmount),
                    startDate: new Date(leaseData.startDate).toISOString(),
                    endDate: leaseData.endDate ? new Date(leaseData.endDate).toISOString() : undefined,
                    status: 'ACTIVE'
                } as any
            });

            if (error) throw error;

            setShowLeaseModal(false);
            fetchTenant(); // Refresh to show the new lease
        } catch (err) {
            alert('Failed to create lease: ' + JSON.stringify(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Loading profile...</p></div>;
    if (!tenant) return <div className={styles.container}><p>Tenant not found.</p></div>;

    return (
        <div className={styles.container} suppressHydrationWarning>
            <button
                onClick={() => router.push('/tenants')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '1.5rem',
                    padding: 0
                }}
            >
                <ArrowLeft size={16} />
                Back to Tenants
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 700,
                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                    }}>
                        {tenant.firstName[0]}{tenant.lastName[0]}
                    </div>
                    <div>
                        <h1 className={styles.title} style={{ marginBottom: '0.25rem' }}>{tenant.firstName} {tenant.lastName}</h1>
                        <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Mail size={14} /> {tenant.email}
                            </span>
                            {tenant.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Phone size={14} /> {tenant.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className={styles.buttonSecondary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Edit size={16} />
                        Edit Profile
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>System Active Since</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{new Date(tenant.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Occupancy</span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: (tenant.leases?.length > 0) ? '#10b981' : '#f59e0b',
                                    background: (tenant.leases?.length > 0) ? '#ecfdf5' : '#fffbeb',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '9999px'
                                }}>{(tenant.leases?.length > 0) ? 'ACTIVE' : 'NO ACTIVE LEASE'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Leases */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>Lease Agreements</h3>
                            <button
                                onClick={() => setShowLeaseModal(true)}
                                className={styles.buttonPrimary}
                                style={{ padding: '0.5rem 0.875rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <Plus size={14} /> New Lease
                            </button>
                        </div>

                        {!tenant.leases || tenant.leases.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <FileText size={32} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>No lease history found for this tenant.</p>
                                <button className={styles.buttonSecondary} onClick={() => setShowLeaseModal(true)}>Create First Lease</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {tenant.leases.map((lease: any) => (
                                    <div key={lease.id} style={{
                                        padding: '1.25rem',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 1fr auto',
                                        gap: '1.5rem',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            background: '#f1f5f9',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Home size={20} color="#6366f1" />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <h4 style={{ fontSize: '0.925rem', fontWeight: 600, margin: 0 }}>Unit {lease.unit?.number}</h4>
                                                <span style={{
                                                    fontSize: '0.625rem',
                                                    fontWeight: 700,
                                                    background: lease.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                                                    color: lease.status === 'ACTIVE' ? '#15803d' : '#64748b',
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: '4px'
                                                }}>{lease.status}</span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0' }}>
                                                {lease.unit?.property?.name} • {lease.unit?.property?.city}
                                            </p>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#475569' }}>
                                                    <Calendar size={12} /> {new Date(lease.startDate).toLocaleDateString()} - {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'Present'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>€{lease.rentAmount || 0}</div>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Monthly Rent</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showLeaseModal && (
                <Modal
                    title="Connect Tenant to property (New Lease)"
                    onClose={() => setShowLeaseModal(false)}
                    onConfirm={handleCreateLease}
                    isSubmitting={isSubmitting}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Select Property & Unit</label>
                            <select
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                                value={leaseData.unitId}
                                onChange={e => setLeaseData({ ...leaseData, unitId: e.target.value })}
                            >
                                <option value="">-- Choose Unit --</option>
                                {properties.map(prop => (
                                    <optgroup key={prop.id} label={prop.name}>
                                        {prop.units?.map((u: any) => (
                                            <option key={u.id} value={u.id}>Unit {u.number} ({u.type})</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Monthly Rent (€)</label>
                                <input
                                    type="number"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    value={leaseData.rentAmount}
                                    onChange={e => setLeaseData({ ...leaseData, rentAmount: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Deposit (€)</label>
                                <input
                                    type="number"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    value={leaseData.depositAmount}
                                    onChange={e => setLeaseData({ ...leaseData, depositAmount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Start Date</label>
                                <input
                                    type="date"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    value={leaseData.startDate}
                                    onChange={e => setLeaseData({ ...leaseData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>End Date (Optional)</label>
                                <input
                                    type="date"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    value={leaseData.endDate}
                                    onChange={e => setLeaseData({ ...leaseData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
