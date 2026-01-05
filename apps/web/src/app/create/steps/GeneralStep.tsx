import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generalInfoSchema, ManagementType } from '@buena/shared';
import { useWizardStore } from '@/store/wizard';
import styles from '../wizard.module.css';
import { useState } from 'react';

export default function GeneralStep() {
    const { generalInfo, setGeneralInfo, setStep, setUnits } = useWizardStore();

    const form = useForm({
        resolver: zodResolver(generalInfoSchema),
        defaultValues: generalInfo,
    });

    // Local upload state
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

    // Extraction state
    const [extracting, setExtracting] = require('react').useState(false);

    const onSubmit = (data: any) => {
        setGeneralInfo(data);
        setStep(2);
    };

    return (
        <form id="wizard-step-form" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Notification Banner */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: notification.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    zIndex: 10000,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    minWidth: '300px'
                }}>
                    {notification.message}
                </div>
            )}
            
            <h2 className={styles.title}>General Information</h2>

            <div className={styles.formGroup}>
                <label className={styles.label}>Property Name</label>
                <input
                    {...form.register('name')}
                    className={styles.input}
                    placeholder="e.g. Sunset Gardens"
                />
                {form.formState.errors.name && (
                    <p className={styles.error}>{form.formState.errors.name.message as string}</p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Management Type</label>
                <select {...form.register('managementType')} className={styles.select}>
                    <option value={ManagementType.WEG}>WEG</option>
                    <option value={ManagementType.MV}>MV</option>
                </select>
            </div>

            <div className={styles.row}>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Manager ID (Mock)</label>
                        <input {...form.register('managerId')} className={styles.input} />
                    </div>
                </div>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Accountant ID (Mock)</label>
                        <input {...form.register('accountantId')} className={styles.input} />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Teilungserklärung (PDF)</label>
                <input
                    type="file"
                    accept="application/pdf"
                    className={styles.input}
                    disabled={uploading}
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setUploading(true);
                            try {
                                const formData = new FormData();
                                formData.append('file', file);

                                // Hardcoded for now, ideal to use env var consistent with client
                                const res = await fetch('http://localhost:3333/storage/upload', {
                                    method: 'POST',
                                    body: formData
                                });

                                if (!res.ok) throw new Error('Upload failed');

                                const json = await res.json();
                                console.log('Uploaded:', json);

                                // Store the path/filename
                                form.setValue('documentId', json.filename); // Using filename as ID for now
                                setNotification({type: 'success', message: 'Document uploaded successfully!'});
                                setTimeout(() => setNotification(null), 3000);
                            } catch (err) {
                                console.error(err);
                                setNotification({type: 'error', message: 'Upload failed. Please try again.'});
                                setTimeout(() => setNotification(null), 5000);
                            } finally {
                                setUploading(false);
                            }
                        }
                    }}
                />
                <p className={styles.cardMeta} style={{ marginTop: '0.5rem' }}>
                    {uploading ? 'Uploading...' : 'Upload the Declaration of Division used to validate unit shares.'}
                </p>
                {/* Visual feedback if uploaded */}
                {form.watch('documentId') && form.watch('documentId') !== 'mock-doc-id' && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✓ Document attached: {form.watch('documentId')}
                        </div>
                        <p className={styles.cardMeta} style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            You can auto-fill units from this PDF in Step 3.
                        </p>
                    </div>
                )}
            </div>
        </form>
    );
}
