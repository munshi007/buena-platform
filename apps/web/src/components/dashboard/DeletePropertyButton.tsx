'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';

export default function DeletePropertyButton({ id, name }: { id: string, name: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // @ts-ignore
            const { error } = await client.DELETE('/properties/{id}' as any, {
                params: { path: { id } }
            });

            if (error) {
                alert('Failed to delete property');
                console.error(error);
                setIsDeleting(false);
                return;
            }

            // Simple refresh or redirect
            router.refresh();
            setShowModal(false);
        } catch (e) {
            console.error(e);
            alert('An unexpected error occurred');
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(true);
                }}
                style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Delete Property"
            >
                {/* Trash Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(false);
                }}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem', color: '#111827' }}>Delete Property</h3>
                        <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone and will delete all associated buildings and units.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
