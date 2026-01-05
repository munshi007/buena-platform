export default function SettingsPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: 800 }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem', color: '#0f172a' }}>Account Settings</h1>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Profile</h3>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, color: '#64748b' }}>JD</div>
                        <div>
                            <button style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 500, color: '#334155' }}>Upload New Photo</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>First Name</label>
                            <input type="text" defaultValue="John" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Last Name</label>
                            <input type="text" defaultValue="Doe" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
