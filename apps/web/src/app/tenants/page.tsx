'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';
import styles from '../dashboard.module.css';
import { Users, UserPlus, Mail, Phone, Home, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

const Modal = ({ title, children, onClose, onConfirm, confirmText = 'Save', cancelText = 'Cancel', isSubmitting = false }: any) => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '480px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                </div>
                <div style={{ marginBottom: '1.5rem', color: '#4b5563', lineHeight: '1.5' }}>{children}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button onClick={onClose} style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{cancelText}</button>
                    <button onClick={onConfirm} disabled={isSubmitting} style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                        {isSubmitting ? 'Saving...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function TenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    const fetchTenants = async () => {
        setLoading(true);
        const { data } = await client.GET('/tenants', {});
        setTenants((data as unknown as any[]) || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleDeleteTenant = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This will also remove all associated leases.`)) {
            return;
        }

        try {
            const { error } = await client.DELETE('/tenants/{id}' as any, {
                params: { path: { id } }
            } as any);

            if (error) throw error;
            fetchTenants();
        } catch (err) {
            alert('Failed to delete tenant: ' + JSON.stringify(err));
        }
    };

    const handleCreateTenant = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email) {
            alert('Please fill in Name and Email');
            return;
        }

        setIsSubmitting(true);
        const { data, error } = await client.POST('/tenants', {
            body: formData as any
        });

        if (error) {
            alert('Failed to create tenant: ' + JSON.stringify(error));
            setIsSubmitting(false);
        } else {
            // Refetch data first
            await fetchTenants();
            // Show success or redirect? Let's just reset and close for now but with a toast-like notice
            setShowAddModal(false);
            setFormData({ firstName: '', lastName: '', email: '', phone: '' });
            setIsSubmitting(false);

            if (data && (data as any).id) {
                router.push(`/tenants/${(data as any).id}`);
            }
        }
    };

    return (
        <div className={styles.container} suppressHydrationWarning>
            <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 className={styles.title}>Tenants</h1>
                    <p className={styles.subtitle}>Manage your residents and lease agreements.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={styles.buttonPrimary}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <UserPlus size={18} />
                    Add Tenant
                </button>
            </div>

            {showAddModal && (
                <Modal
                    title="Add New Tenant"
                    onClose={() => setShowAddModal(false)}
                    onConfirm={handleCreateTenant}
                    isSubmitting={isSubmitting}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>First Name</label>
                                <input
                                    className={styles.input}
                                    style={{ width: '100%', padding: '0.625rem' }}
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Last Name</label>
                                <input
                                    className={styles.input}
                                    style={{ width: '100%', padding: '0.625rem' }}
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Email Address</label>
                            <input
                                className={styles.input}
                                style={{ width: '100%', padding: '0.625rem' }}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john.doe@example.com"
                                type="email"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Phone Number (Optional)</label>
                            <input
                                className={styles.input}
                                style={{ width: '100%', padding: '0.625rem' }}
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+49 123 456789"
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading tenants...</div>
            ) : tenants.length === 0 ? (
                <div className={styles.emptyState} style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div className={styles.emptyIcon} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', color: '#cbd5e1' }}>
                        <Users size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className={styles.emptyTitle} style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>No tenants found</h3>
                    <p className={styles.emptyText} style={{ color: '#64748b' }}>Get started by adding your first resident.</p>
                </div>
            ) : (
                <div className={styles.grid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {tenants.map((tenant: any) => (
                        <div key={tenant.id} className={styles.card} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div className={styles.cardHeader} style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                        {tenant.firstName[0]}{tenant.lastName[0]}
                                    </div>
                                    <div>
                                        <h3 className={styles.cardTitle} style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{tenant.firstName} {tenant.lastName}</h3>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Resident since {new Date(tenant.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteTenant(tenant.id, `${tenant.firstName} ${tenant.lastName}`)}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                                    onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className={styles.cardBody}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                                        <Mail size={14} color="#94a3b8" />
                                        {tenant.email}
                                    </div>
                                    {tenant.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                                            <Phone size={14} color="#94a3b8" />
                                            {tenant.phone}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Leases</h4>
                                    {tenant.leases && tenant.leases.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {tenant.leases.map((lease: any) => (
                                                <div key={lease.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Home size={12} color="#64748b" />
                                                        <span style={{ fontWeight: 500 }}>Unit {lease.unit.number}</span>
                                                    </div>
                                                    <div style={{ color: '#64748b' }}>{new Date(lease.startDate).toLocaleDateString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No active leases</p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.cardFooter} style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                                <Link href={`/tenants/${tenant.id}`} style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Manage Profile &rarr;</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
