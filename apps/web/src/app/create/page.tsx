'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { client } from '@/lib/client';
import { useWizardStore } from '@/store/wizard';
import styles from './wizard.module.css';
import GeneralStep from './steps/GeneralStep';
import BuildingStep from './steps/BuildingStep';
import UnitStep from './steps/UnitStep';
import { useEffect, useState } from 'react';

function WizardPage() {
    // ... inside WizardPage component ...
    const { step, setStep, reset, generalInfo, buildings, units, draftId, setDraftId } = useWizardStore();
    const [mounted, setMounted] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    // ...

    const saveDraft = async (silent = false) => {
        try {
            const payload = {
                generalInfo: { ...generalInfo, status: 'DRAFT' },
                buildings,
                units
            };
            console.log('Saving draft payload:', payload);

            let result;
            if (draftId) {
                // PATCH existing draft
                // @ts-ignore
                const { data, error } = await client.PATCH(`/properties/{id}`, {
                    params: { path: { id: draftId } },
                    body: payload as any
                });

                if (error) {
                    // Fallback: If 404 (deleted), treat as new draft
                    if ((error as any).status === 404 || (error as any).status === 400) {
                        // @ts-ignore
                        const { data: newData, error: newError } = await client.POST('/properties', {
                            body: payload as any
                        });
                        if (newError) throw newError;
                        result = newData;
                        // @ts-ignore
                        if (result?.id) setDraftId(result.id);
                    } else {
                        throw error;
                    }
                } else {
                    result = data;
                }
            } else {
                // CREATE new draft
                // @ts-ignore
                const { data, error } = await client.POST('/properties', {
                    body: payload as any
                });
                if (error) throw error;
                result = data;
                // @ts-ignore
                if (result?.id) setDraftId(result.id);
            }

            if (!silent) alert('Draft saved successfully!');
            return true;
        } catch (e: any) {
            console.error('Save Draft Exception (Full):', e);
            console.error('Save Draft Exception Message:', e?.message);
            console.error('Save Draft Exception Name:', e?.name);

            let displayMsg = '';
            if (e?.data) {
                displayMsg = JSON.stringify(e.data);
                console.error('Save Draft Exception Data:', e.data);
            } else if (e?.message) {
                displayMsg = e.message;
            } else {
                displayMsg = JSON.stringify(e);
            }

            if (!silent) alert(`Failed to save draft: ${displayMsg}`);
            return false;
        }
    };

    const searchParams = useSearchParams();
    const urlDraftId = searchParams.get('draftId');

    // Auto-Save Effect
    useEffect(() => {
        if (!mounted) return;
        if (!generalInfo.name) return; // Only autosave if name exists
        if (showResumeModal) return;   // Don't autosave while prompt is open

        const timer = setTimeout(() => {
            saveDraft(true);
        }, 2000); // 2s debounce

        return () => clearTimeout(timer);
    }, [generalInfo, buildings, units, showResumeModal, mounted]);

    // Initial Load & Draft Logic
    useEffect(() => {
        setMounted(true);

        const checkDrafts = async () => {
            // 1. If explicit draft ID in URL, load it
            if (urlDraftId) {
                // @ts-ignore
                const { data } = await client.GET('/properties');
                if (data) {
                    const properties = data as any[];
                    // @ts-ignore
                    const draft = properties.find(p => p.id === urlDraftId);
                    if (draft) {
                        setDraftId(draft.id);
                        // Only reset store if we truly loaded a new draft
                        useWizardStore.setState({
                            generalInfo: {
                                name: draft.name,
                                managementType: draft.managementType,
                                managerId: draft.managerId,
                                accountantId: draft.accountantId,
                                status: draft.status
                            },
                            buildings: draft.buildings || [],
                            units: draft.units || [],
                            draftId: draft.id
                        });
                        return;
                    }
                }
            }

            // 2. If NO local work / clean slate, check if user has existing drafts
            // Only check if we are NOT already editing a specific draft
            if (!draftId && !urlDraftId && !generalInfo.name) {
                // @ts-ignore
                const { data } = await client.GET('/properties');
                if (data) {
                    const drafts = (data as any[]).filter(p => p.status === 'DRAFT');
                    if (drafts.length > 0) {
                        // User has existing drafts, prompt them
                        setShowResumeModal(true);
                        return;
                    }
                }
            }

            // 3. If we have local unfinished work, check if it's still valid
            if (draftId && !urlDraftId) {
                // @ts-ignore
                const { error } = await client.GET('/properties/{id}', {
                    params: { path: { id: draftId } }
                });
                if (error) {
                    console.warn("Local draft deleted, resetting.");
                    setDraftId(null);
                }
            }

            // Show resume modal if local work implies it
            if ((step > 1 || generalInfo.name) && !urlDraftId) {
                setShowResumeModal(true);
            }
        };

        checkDrafts();
    }, [urlDraftId]);

    if (!mounted) return null;

    const handleSaveAndStartNew = async () => {
        const success = await saveDraft(true);
        if (success) {
            reset();
            setShowResumeModal(false);
            // Maybe alert or toast here? "Draft saved. Starting new..."
        }
    };

    const handleDiscardAndStartNew = () => {
        // Explicitly discard
        if (window.confirm("Are you sure you want to discard this draft? It will be lost forever.")) {
            reset();
            setShowResumeModal(false);
        }
    };

    const handleResume = () => {
        setShowResumeModal(false);
    };

    const handleNext = () => {
        if (step === 1) {
            (document.getElementById('wizard-step-form') as HTMLFormElement)?.requestSubmit();
        } else if (step === 2) {
            (document.getElementById('wizard-step-form') as HTMLFormElement)?.requestSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className={styles.container} suppressHydrationWarning>
            <div className={styles.header} suppressHydrationWarning>
                <h1 className={styles.title}>Create New Property</h1>

                <div className={styles.stepper}>
                    <div className={`${styles.stepItem} ${step >= 1 ? styles.stepItemActive : ''} ${step > 1 ? styles.stepItemCompleted : ''}`}>
                        <div className={styles.stepCircle}>{step > 1 ? '✓' : '1'}</div>
                        <span className={styles.stepLabel}>General</span>
                    </div>
                    <div className={styles.stepLine} />
                    <div className={`${styles.stepItem} ${step >= 2 ? styles.stepItemActive : ''} ${step > 2 ? styles.stepItemCompleted : ''}`}>
                        <div className={styles.stepCircle}>{step > 2 ? '✓' : '2'}</div>
                        <span className={styles.stepLabel}>Buildings</span>
                    </div>
                    <div className={styles.stepLine} />
                    <div className={`${styles.stepItem} ${step >= 3 ? styles.stepItemActive : ''}`}>
                        <div className={styles.stepCircle}>3</div>
                        <span className={styles.stepLabel}>Units</span>
                    </div>
                </div>
            </div>

            <div className={styles.content} suppressHydrationWarning>
                {step === 1 && <GeneralStep />}
                {step === 2 && <BuildingStep />}
                {step === 3 && <UnitStep />}
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={handleBack}
                    disabled={step === 1}
                >
                    Back
                </button>

                <button
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={() => saveDraft(false)}
                    style={{ marginLeft: '1rem', marginRight: 'auto' }}
                >
                    Save Draft
                </button>

                {step < 3 && (
                    // Form submission is handled via event dispatch or ref
                    <button className={styles.button} onClick={handleNext}>
                        Next Step
                    </button>
                )}
            </div>
            {showResumeModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '480px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem', color: '#111827' }}>
                            {generalInfo.name ? 'Resume Editing?' : 'Existing Drafts Found'}
                        </h3>
                        <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            {generalInfo.name
                                ? <span>You have unsaved changes for <strong>{generalInfo.name}</strong>.</span>
                                : <span>You have unfinished drafts in your dashboard. Would you like to view them or start a new property?</span>
                            }
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {generalInfo.name ? (
                                // Case A: Local Work Exists
                                <>
                                    <button
                                        onClick={handleResume}
                                        style={{ padding: '0.75rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', cursor: 'pointer', fontSize: '0.925rem', fontWeight: 600, width: '100%' }}
                                    >
                                        Resume "{generalInfo.name}"
                                    </button>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={handleSaveAndStartNew}
                                            style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
                                        >
                                            Save & New
                                        </button>
                                        <button
                                            onClick={handleDiscardAndStartNew}
                                            style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff1f2', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#ef4444' }}
                                        >
                                            Discard
                                        </button>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                        <a href="/properties?tab=draft" style={{ color: '#6366f1', fontSize: '0.875rem', textDecoration: 'none' }}>or view all drafts</a>
                                    </div>
                                </>
                            ) : (
                                // Case B: No Local Work, but Backend Drafts Exist
                                <>
                                    <a
                                        href="/properties?tab=draft"
                                        style={{ display: 'block', textAlign: 'center', padding: '0.75rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', cursor: 'pointer', fontSize: '0.925rem', fontWeight: 600, textDecoration: 'none' }}
                                    >
                                        View Drafts
                                    </a>
                                    <button
                                        onClick={() => setShowResumeModal(false)}
                                        style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
                                    >
                                        Start Fresh Property
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <WizardPage />
        </Suspense>
    );
}
