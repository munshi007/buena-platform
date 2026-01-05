'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Building2,
    Users,
    BarChart3,
    Wallet,
    Settings,
    Shield
} from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './sidebar.module.css';

// Dynamically import ThemeToggle with no SSR to prevent hydration issues
const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <div className={styles.sidebar} suppressHydrationWarning>
            <div className={styles.logo} suppressHydrationWarning>
                <div className={styles.logoIcon} suppressHydrationWarning>
                    <Shield size={20} fill="currentColor" />
                </div>
                Buena
            </div>

            <nav className={styles.nav} suppressHydrationWarning>
                <Link
                    href="/"
                    className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`}
                >
                    <LayoutDashboard size={18} className={styles.navIcon} strokeWidth={isActive('/') ? 2.5 : 2} />
                    Dashboard
                </Link>
                <Link
                    href="/properties"
                    className={`${styles.navItem} ${isActive('/properties') ? styles.navItemActive : ''}`}
                >
                    <Building2 size={18} className={styles.navIcon} strokeWidth={isActive('/properties') ? 2.5 : 2} />
                    Properties
                </Link>
                <Link
                    href="/tenants"
                    className={`${styles.navItem} ${isActive('/tenants') ? styles.navItemActive : ''}`}
                >
                    <Users size={18} className={styles.navIcon} strokeWidth={isActive('/tenants') ? 2.5 : 2} />
                    Tenants
                </Link>
                <Link
                    href="/reports"
                    className={`${styles.navItem} ${isActive('/reports') ? styles.navItemActive : ''}`}
                >
                    <BarChart3 size={18} className={styles.navIcon} strokeWidth={isActive('/reports') ? 2.5 : 2} />
                    Reports
                </Link>
                <Link
                    href="/finances"
                    className={`${styles.navItem} ${isActive('/finances') ? styles.navItemActive : ''}`}
                >
                    <Wallet size={18} className={styles.navIcon} strokeWidth={isActive('/finances') ? 2.5 : 2} />
                    Finances
                </Link>
                <Link
                    href="/settings"
                    className={`${styles.navItem} ${isActive('/settings') ? styles.navItemActive : ''}`}
                >
                    <Settings size={18} className={styles.navIcon} strokeWidth={isActive('/settings') ? 2.5 : 2} />
                    Settings
                </Link>
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid hsl(var(--border))' }} suppressHydrationWarning>
                <ThemeToggle />
            </div>

            <div className={styles.user} suppressHydrationWarning>
                <div className={styles.avatar}>JD</div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>John Doe</span>
                    <span className={styles.userRole}>Property Manager</span>
                </div>
            </div>
        </div>
    );
}
