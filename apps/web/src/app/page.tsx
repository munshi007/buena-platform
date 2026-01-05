import { client } from '@/lib/client';
import Link from 'next/link';
import DeletePropertyButton from '@/components/dashboard/DeletePropertyButton';
import styles from './dashboard.module.css';
import { Building2, DoorOpen, Layers, AlertCircle, Building } from 'lucide-react';

export default async function Dashboard() {
  const { data: properties, error } = await client.GET('/properties');

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Dashboard</h1>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#64748b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Unable to load properties</h3>
            <p style={{ fontSize: '0.875rem' }}>Please check your connection or try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} suppressHydrationWarning>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back to your portfolio overview.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Building2 size={20} className={styles.metricIcon} />
            <span className={styles.metricLabel} style={{ marginBottom: 0 }}>Total Properties</span>
          </div>
          <div className={styles.metricValue}>{(properties as any)?.length || 0}</div>
        </div>
        <div className={styles.metricCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <DoorOpen size={20} className={styles.metricIcon} />
            <span className={styles.metricLabel} style={{ marginBottom: 0 }}>Total Units</span>
          </div>
          <div className={styles.metricValue}>
            {(properties as any)?.reduce((acc: number, p: any) => acc + (p.units?.length || 0), 0)}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Layers size={20} className={styles.metricIcon} />
            <span className={styles.metricLabel} style={{ marginBottom: 0 }}>Total Buildings</span>
          </div>
          <div className={styles.metricValue}>
            {(properties as any)?.reduce((acc: number, p: any) => acc + (p.buildings?.length || 0), 0)}
          </div>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent Properties</h2>
        <Link href="/properties" className={styles.sectionLink}>View All &rarr;</Link>
      </div>

      <div className={styles.grid}>
        {(properties as any)?.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Building size={48} />
            </div>
            <h3 className={styles.emptyTitle}>No properties yet</h3>
            <p className={styles.emptyText}>Get started by adding your first property to the portfolio.</p>
            <Link href="/create" className={styles.buttonPrimary}>
              Create Property
            </Link>
          </div>
        )}

        {(properties as any)?.slice(0, 3).map((property: any) => (
          <Link href={`/properties/${property.id}`} key={property.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.badges}>
                <span className={styles.badgeId}>{property.propertyNumber}</span>
                <span className={`${styles.badgeType} ${styles[property.managementType]}`}>{property.managementType}</span>
              </div>
              <div>
                <DeletePropertyButton id={property.id} name={property.name} />
              </div>
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{property.name}</h3>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{property.units?.length || 0}</span>
                  <span className={styles.statLabel}>Units</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{property.buildings?.length || 0}</span>
                  <span className={styles.statLabel}>Buildings</span>
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.viewLink}>View Dashboard &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
