'use client';

import { useState, useEffect } from 'react';
import { client } from '@/lib/client';
import styles from '../dashboard.module.css';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, ArrowUpRight, ArrowDownRight, X, Trash2, Edit2 } from 'lucide-react';

const Modal = ({ title, children, onClose, onConfirm, confirmText = 'Save', cancelText = 'Cancel', isSubmitting = false }: any) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '480px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: 600 }}>{title}</h3>
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

export default function FinancesPage() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    propertyId: '',
    amount: 0,
    type: 'REVENUE',
    category: 'RENT',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, transRes, propsRes] = await Promise.all([
      client.GET('/finances/stats' as any, {}),
      client.GET('/finances' as any, {}),
      client.GET('/properties' as any, {})
    ]);

    setStats(statsRes.data);
    setTransactions((transRes.data as unknown as any[]) || []);
    const props = (propsRes.data as unknown as any[]) || [];
    setProperties(props);

    if (props.length > 0 && !formData.propertyId) {
      setFormData(prev => ({ ...prev, propertyId: props[0].id }));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (transaction: any) => {
    setEditingId(transaction.id);
    setFormData({
      propertyId: transaction.propertyId,
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const { error } = await client.DELETE('/finances/{id}' as any, {
        params: { path: { id } }
      } as any);

      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('Failed to delete transaction: ' + JSON.stringify(err));
    }
  };

  const handleSaveTransaction = async () => {
    if (!formData.propertyId || !formData.amount) {
      alert('Please select a property and enter an amount');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update
        const { error } = await client.PATCH('/finances/{id}' as any, {
          params: { path: { id: editingId } },
          body: {
            ...formData,
            amount: Number(formData.amount),
            date: new Date(formData.date).toISOString()
          } as any
        } as any);
        if (error) throw error;
      } else {
        // Create
        const { error } = await client.POST('/finances' as any, {
          body: {
            ...formData,
            amount: Number(formData.amount),
            date: new Date(formData.date).toISOString()
          } as any
        });
        if (error) throw error;
      }

      setShowAddModal(false);
      setFormData(prev => ({ ...prev, amount: 0, description: '' }));
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Failed to save transaction: ' + JSON.stringify(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <div className={styles.container} suppressHydrationWarning>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className={styles.title}>Finances</h1>
          <p className={styles.subtitle}>Track your portfolio revenue and expenses.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              propertyId: properties[0]?.id || '',
              amount: 0,
              type: 'REVENUE',
              category: 'RENT',
              date: new Date().toISOString().split('T')[0],
              description: ''
            });
            setShowAddModal(true);
          }}
          className={styles.buttonPrimary}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {showAddModal && (
        <Modal
          title={editingId ? "Edit Transaction" : "Add New Transaction"}
          onClose={() => setShowAddModal(false)}
          onConfirm={handleSaveTransaction}
          isSubmitting={isSubmitting}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Property</label>
              <select
                className={styles.input}
                style={{ width: '100%', padding: '0.625rem', background: 'white' }}
                value={formData.propertyId}
                onChange={e => setFormData({ ...formData, propertyId: e.target.value })}
              >
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Type</label>
                <select
                  className={styles.input}
                  style={{ width: '100%', padding: '0.625rem', background: 'white' }}
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="REVENUE">Revenue (+)</option>
                  <option value="EXPENSE">Expense (-)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Category</label>
                <select
                  className={styles.input}
                  style={{ width: '100%', padding: '0.625rem', background: 'white' }}
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="RENT">Rent</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="TAX">Tax</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Amount (€)</label>
                <input
                  className={styles.input}
                  type="number"
                  style={{ width: '100%', padding: '0.625rem' }}
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Date</label>
                <input
                  className={styles.input}
                  type="date"
                  style={{ width: '100%', padding: '0.625rem' }}
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Description</label>
              <input
                className={styles.input}
                style={{ width: '100%', padding: '0.625rem' }}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. November Rent"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Financial Metrics */}
      <div className={styles.metricsGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className={styles.metricCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={20} color="#22c55e" />
            <span className={styles.metricLabel} style={{ marginBottom: 0 }}>Total Revenue</span>
          </div>
          <div className={styles.metricValue}>{formatter.format(Number(stats?.revenue || 0))}</div>
        </div>
        <div className={styles.metricCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <TrendingDown size={20} color="#ef4444" />
            <span className={styles.metricLabel} style={{ marginBottom: 0 }}>Total Expenses</span>
          </div>
          <div className={styles.metricValue}>{formatter.format(Number(stats?.expenses || 0))}</div>
        </div>
        <div className={styles.metricCard} style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <PieChart size={20} color="#6366f1" />
            <span className={styles.metricLabel} style={{ marginBottom: 0 }}>Net Profit (P&L)</span>
          </div>
          <div className={styles.metricValue} style={{ color: Number(stats?.netProfit || 0) >= 0 ? '#0f172a' : '#ef4444' }}>
            {formatter.format(Number(stats?.netProfit || 0))}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <DollarSign size={20} color="#94a3b8" />
            <span className={styles.metricLabel} style={{ marginBottom: 0 }}>Transactions</span>
          </div>
          <div className={styles.metricValue}>{stats?.transactionCount || 0}</div>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b' }}>Date</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b' }}>Description</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b' }}>Property</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b' }}>Category</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading transactions...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No transactions recorded yet.</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', fontWeight: 500, color: '#1e293b' }}>{t.description || 'No description'}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{t.property?.name || 'Unknown'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#f1f5f9',
                      color: '#475569'
                    }}>
                      {t.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: t.type === 'REVENUE' ? '#10b981' : '#ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      {t.type === 'REVENUE' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {formatter.format(Number(t.amount))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditClick(t)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.25rem' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
