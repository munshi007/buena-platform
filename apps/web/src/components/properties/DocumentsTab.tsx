'use client';

import { useState } from 'react';
import { File, Upload, History, FileText, Download, Trash2, X } from 'lucide-react';
import { client } from '@/lib/client';

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
                        {isSubmitting ? 'Uploading...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function DocumentsTab({ propertyId, initialDocuments }: { propertyId: string, initialDocuments: any[] }) {
    const [documents, setDocuments] = useState<any[]>(initialDocuments || []);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Upload Form State
    const [uploadData, setUploadData] = useState({ name: '', kind: 'LEASE', file: null as File | null });
    const [isNewVersion, setIsNewVersion] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadData({ ...uploadData, file: e.target.files[0], name: uploadData.name || e.target.files[0].name.split('.')[0] });
        }
    };

    const processUpload = async () => {
        if (!uploadData.file) return alert('Please select a file');

        setIsSubmitting(true);
        try {
            // 1. Upload to storage
            const formData = new FormData();
            formData.append('file', uploadData.file);

            const storageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/storage/upload`, {
                method: 'POST',
                body: formData
            });
            const storageData = await storageRes.json();

            // 2. Link to document/version
            if (isNewVersion && selectedDocId) {
                await client.POST(`/documents/${selectedDocId}/versions` as any, {
                    body: storageData
                } as any);
            } else {
                await client.POST(`/documents/${propertyId}` as any, {
                    body: {
                        name: uploadData.name,
                        kind: uploadData.kind,
                        file: storageData
                    }
                } as any);
            }

            // 3. Refresh (hacky refresh by re-fetching property or just updated state)
            window.location.reload(); // Simple refresh to show new data
        } catch (error) {
            alert('Upload failed: ' + error);
        } finally {
            setIsSubmitting(false);
            setShowUploadModal(false);
        }
    };

    const selectedDoc = documents.find(d => d.id === selectedDocId);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: selectedDocId ? '1fr 350px' : '1fr', gap: '2rem' }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>Property Documents</h3>
                    <button
                        onClick={() => { setIsNewVersion(false); setShowUploadModal(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none' }}
                    >
                        <Upload size={16} />
                        Upload Document
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {documents.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                            <File size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No documents uploaded yet.</p>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
                                style={{
                                    padding: '1rem',
                                    background: 'white',
                                    borderRadius: '12px',
                                    border: selectedDocId === doc.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={20} color="#6366f1" />
                                    </div>
                                    <div style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, color: '#475569' }}>
                                        V{doc.versions?.length || 1}
                                    </div>
                                </div>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</h4>
                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.kind}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedDocId && selectedDoc && (
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>History</h3>
                        <button onClick={() => setSelectedDocId(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {selectedDoc.versions.map((v: any, idx: number) => (
                            <div key={v.id} style={{ background: 'white', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: idx === 0 ? '#10b981' : '#64748b' }}>
                                        {idx === 0 ? 'CURRENT VERSION (v' + v.version + ')' : 'VERSION ' + v.version}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {new Date(v.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: '0.75rem' }}>{v.originalName}</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${v.storageKey.startsWith('/') ? v.storageKey : '/uploads/' + v.storageKey}`}
                                        target="_blank"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: 'white', color: 'inherit', textDecoration: 'none' }}
                                    >
                                        <Download size={14} /> View
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => { setIsNewVersion(true); setShowUploadModal(true); }}
                        style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #6366f1', color: '#6366f1', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: '#f5f3ff' }}
                    >
                        <History size={18} />
                        Upload New Version
                    </button>
                </div>
            )}

            {showUploadModal && (
                <Modal
                    title={isNewVersion ? "Upload New Version" : "Upload Document"}
                    onClose={() => setShowUploadModal(false)}
                    onConfirm={processUpload}
                    isSubmitting={isSubmitting}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {!isNewVersion && (
                            <>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Document Name</label>
                                    <input
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                                        value={uploadData.name}
                                        onChange={e => setUploadData({ ...uploadData, name: e.target.value })}
                                        placeholder="e.g. Master Lease 2024"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Kind</label>
                                    <select
                                        style={{ width: '100%', padding: '0.625rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                                        value={uploadData.kind}
                                        onChange={e => setUploadData({ ...uploadData, kind: e.target.value })}
                                    >
                                        <option value="LEASE">Lease</option>
                                        <option value="TEILUNGSERKLAERUNG">Teilungserklärung</option>
                                        <option value="FLOOR_PLAN">Floor Plan</option>
                                        <option value="MAINTENANCE_RECORD">Maintenance</option>
                                        <option value="INSURANCE_POLICY">Insurance</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </>
                        )}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Select File</label>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                style={{ fontSize: '0.875rem' }}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
