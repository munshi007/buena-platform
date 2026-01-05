import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useWizardStore } from '@/store/wizard';
import { parseTSV } from '@buena/shared';
import styles from '../wizard.module.css';
import { client } from '@/lib/client';
import { useRouter } from 'next/navigation';

const UnitType = {
    APARTMENT: 'APARTMENT',
    OFFICE: 'OFFICE',
    GARDEN: 'GARDEN',
    PARKING: 'PARKING',
    OTHER: 'OTHER',
} as const;
type UnitType = keyof typeof UnitType;

const COLUMN_WIDTHS = [70, 110, 150, 140, 90, 80, 90, 90, 90, 50]; // Adjusted widths for better visibility
const TOTAL_WIDTH = COLUMN_WIDTHS.reduce((sum, width) => sum + width, 0);
const ROW_HEIGHT = 40;

const UnitRow = memo(({ index, row, updateRow, deleteRow, buildings }: any) => {
    return (
        <div style={{ height: ROW_HEIGHT, width: '100%' }} className={styles.row}>
            <input
                className={styles.input}
                style={{ width: COLUMN_WIDTHS[0], flexShrink: 0 }}
                value={row.number || ''}
                onChange={(e) => updateRow(index, 'number', e.target.value)}
                placeholder="#"
            />
            <div style={{ width: COLUMN_WIDTHS[1], flexShrink: 0 }}>
                {!(row.type && !['APARTMENT', 'OFFICE', 'GARDEN', 'PARKING'].includes(row.type)) && row.type !== 'OTHER' ? (
                    <select
                        className={styles.select}
                        style={{ width: '100%' }}
                        value={row.type || 'APARTMENT'}
                        onChange={(e) => updateRow(index, 'type', e.target.value)}
                    >
                        <option value="APARTMENT">APARTMENT</option>
                        <option value="OFFICE">OFFICE</option>
                        <option value="GARDEN">GARDEN</option>
                        <option value="PARKING">PARKING</option>
                        <option value="OTHER">OTHER...</option>
                    </select>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                            className={styles.input}
                            style={{ width: '100%', minWidth: 0 }}
                            value={row.type === 'OTHER' ? '' : row.type}
                            onChange={(e) => updateRow(index, 'type', e.target.value)}
                            placeholder="Type..."
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => updateRow(index, 'type', 'APARTMENT')}
                            className={styles.buttonSecondary}
                            style={{ padding: '0 4px', height: '2rem', fontSize: '10px' }}
                            title="Back to list"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
            <select
                className={styles.select}
                style={{ width: COLUMN_WIDTHS[2], flexShrink: 0 }}
                value={row.buildingTempId || ''}
                onChange={(e) => updateRow(index, 'buildingTempId', e.target.value)}
            >
                {buildings.map((b: any) => (
                    <option key={b.tempId} value={b.tempId}>{b.street} {b.houseNumber}</option>
                ))}
            </select>
            <input
                className={styles.input}
                style={{ width: COLUMN_WIDTHS[3], flexShrink: 0 }}
                value={row.floor || ''}
                onChange={(e) => updateRow(index, 'floor', e.target.value)}
                placeholder="Floor"
                title={row.floor || ''}
            />
            <input className={styles.input} style={{ width: COLUMN_WIDTHS[4], flexShrink: 0 }} value={row.entrance || ''} onChange={(e) => updateRow(index, 'entrance', e.target.value)} placeholder="Entr." />
            <input type="number" className={styles.input} style={{ width: COLUMN_WIDTHS[5], flexShrink: 0 }} value={row.size || 0} onChange={(e) => updateRow(index, 'size', parseFloat(e.target.value))} />
            <input type="number" className={styles.input} style={{ width: COLUMN_WIDTHS[6], flexShrink: 0 }} value={row.coOwnershipShare || 0} onChange={(e) => updateRow(index, 'coOwnershipShare', parseFloat(e.target.value))} />
            <input type="number" className={styles.input} style={{ width: COLUMN_WIDTHS[7], flexShrink: 0 }} value={row.constructionYear || ''} onChange={(e) => updateRow(index, 'constructionYear', parseInt(e.target.value))} placeholder="Year" />
            <input type="number" className={styles.input} style={{ width: COLUMN_WIDTHS[8], flexShrink: 0 }} value={row.rooms || 0} onChange={(e) => updateRow(index, 'rooms', parseFloat(e.target.value))} />

            <button tabIndex={-1} type="button" onClick={() => deleteRow(index)} className={styles.buttonSecondary} style={{ padding: '0 0.5rem', height: '2.5rem', minWidth: '30px', flexShrink: 0 }}>×</button>
        </div>
    );
});
UnitRow.displayName = 'UnitRow';

const Modal = ({ title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', isSingleAction = false, onSecondaryAction, secondaryText }: any) => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', fontFamily: 'inherit' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', color: '#111827' }}>{title}</h3>
                <div style={{ marginBottom: '1.5rem', color: '#4b5563', lineHeight: '1.5' }}>{children}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    {!isSingleAction && <button onClick={onClose} style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{cancelText}</button>}
                    {onSecondaryAction && <button onClick={onSecondaryAction} style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{secondaryText}</button>}
                    <button onClick={onConfirm || onClose} style={{ padding: '0.625rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default function UnitStep() {
    const router = useRouter();
    const { generalInfo, buildings, updateBuilding, units: initialUnits, setUnits, reset } = useWizardStore();

    // Local state for performance, sync on submit
    const [rows, setRows] = useState(initialUnits.length ? initialUnits : []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<{ type: 'confirm' | 'success' | 'error' | 'address-mismatch', title: string, message: string, extractedData?: any } | null>(null);

    // Sync local state back to store for persistence (e.g. if user goes back)
    useEffect(() => {
        setUnits(rows as any);
    }, [rows, setUnits]);

    // Sanitize and Initialize
    useEffect(() => {
        if (buildings.length === 0) return;
        const defaultBuildingId = buildings[0]?.tempId;

        if (rows.length === 0) {
            // Create 10 empty rows default
            const newRows = Array.from({ length: 10 }).map((_, i) => ({
                buildingTempId: defaultBuildingId,
                number: `${i + 1}`,
                type: UnitType.APARTMENT,
                size: 0,
                coOwnershipShare: 0,
            }));
            setRows(newRows as any);
        } else {
            // Sanitize existing rows to ensure they have defaults
            setRows(prev => prev.map(r => ({
                ...r,
                buildingTempId: (buildings.find(b => b.tempId === r.buildingTempId) ? r.buildingTempId : defaultBuildingId) || defaultBuildingId,
                type: r.type || UnitType.APARTMENT,
                size: r.size || 0,
                coOwnershipShare: r.coOwnershipShare || 0,
                number: r.number || '',
            })));
        }
    }, [buildings.length]); // Fix dependency

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        const data = parseTSV(text);

        // Map TSV columns to our schema
        const newRows = data.map((row) => {
            return {
                number: row[0] || '',
                type: (['APARTMENT', 'OFFICE', 'GARDEN', 'PARKING'].includes(row[1] as any) ? row[1] : UnitType.APARTMENT) as UnitType,
                buildingTempId: buildings.find(b => b.tempId === row[2])?.tempId || buildings[0]?.tempId || '',
                floor: row[3] || '',
                entrance: row[4] || '',
                size: parseFloat(row[5]?.replace(',', '.') || '0') || 0,
                coOwnershipShare: parseFloat(row[6]?.replace(',', '.') || '0') || 0,
                constructionYear: parseInt(row[7] || '0') || undefined,
                rooms: parseFloat(row[8]?.replace(',', '.') || '0') || 0,
            };
        });

        setRows(prev => [...prev, ...newRows] as any);
    }, [buildings]);

    const updateRow = (index: number, field: string, value: any) => {
        setRows(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const deleteRow = (index: number) => {
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    const runExtraction = async () => {
        setModalConfig(null); // Close confirm modal
        setIsSubmitting(true);
        try {
            // @ts-ignore
            const { data, error } = await client.POST('/properties/extract', {
                body: { documentId: generalInfo.documentId }
            } as any);

            if (error) {
                // @ts-ignore
                const errMsg = error.message || error.error || JSON.stringify(error);
                throw new Error(errMsg);
            }

            // Handle structure: { units: [], address: string | null } or just [] from legacy
            let extractedUnits: any[] = [];
            let extractedAddress: string | null = null;

            if (data && !Array.isArray(data) && (data as any).units) {
                extractedUnits = (data as any).units;
                extractedAddress = (data as any).address;
            } else if (Array.isArray(data)) {
                extractedUnits = data;
            }

            if (extractedUnits.length > 0) {
                // Map to rows with defaults
                const newRows = extractedUnits.map((u: any) => ({
                    number: u.number || '',
                    type: (u.type || UnitType.APARTMENT) as UnitType,
                    // Map to first building by default, user can adjust
                    buildingTempId: buildings[0]?.tempId,
                    floor: u.floor || '',
                    entrance: u.entrance || '',
                    size: Number(u.size) || 0,
                    coOwnershipShare: Number(u.coOwnershipShare) || 0,
                    rooms: Number(u.rooms) || 0,
                    constructionYear: undefined // extraction doesn't usually get this
                }));

                setRows(newRows as any);

                // VALIDATION WARNINGS
                const warnings: string[] = [];

                // Check for missing data
                const unitsWithZeroSize = newRows.filter((u: any) => !u.size || u.size === 0);
                if (unitsWithZeroSize.length > 0) {
                    warnings.push(`⚠️ ${unitsWithZeroSize.length} unit(s) have 0 sqm - please verify`);
                }

                const unitsWithZeroShares = newRows.filter((u: any) => !u.coOwnershipShare || u.coOwnershipShare === 0);
                if (unitsWithZeroShares.length > 0) {
                    warnings.push(`⚠️ ${unitsWithZeroShares.length} unit(s) have 0 ownership shares`);
                }

                // Check total ownership shares
                const totalShares = newRows.reduce((sum: number, u: any) => sum + (u.coOwnershipShare || 0), 0);
                if (totalShares > 0 && totalShares < 900) {
                    warnings.push(`💡 Total co-ownership shares = ${totalShares.toFixed(1)}/1000 - missing ${(1000 - totalShares).toFixed(1)} shares`);
                }

                // Check for address mismatch
                const currentAddress = `${buildings[0]?.street || ''} ${buildings[0]?.houseNumber || ''}`.trim();
                if (extractedAddress && extractedAddress.length > 5 && !currentAddress.toLowerCase().includes(extractedAddress.toLowerCase().substring(0, 10))) {
                    setModalConfig({
                        type: 'address-mismatch',
                        title: 'Extraction Complete',
                        message: `Found ${newRows.length} units! \n\nThe extracted address "${extractedAddress}" looks different from your building address "${currentAddress}". Do you want to update it?${warnings.length > 0 ? '\n\n' + warnings.join('\n') : ''}`,
                        extractedData: { address: extractedAddress }
                    });
                } else {
                    const successMessage = warnings.length > 0
                        ? `✨ Automatically filled ${newRows.length} units from the PDF!\n\nPlease review:\n${warnings.join('\n')}`
                        : `✨ Automatically filled ${newRows.length} units from the PDF!`;

                    setModalConfig({
                        type: 'success',
                        title: 'Extraction Complete',
                        message: successMessage
                    });
                }

            } else {
                setModalConfig({
                    type: 'success',
                    title: 'No Units Found',
                    message: `The AI processed the document but couldn't find any specific unit tables. Try checking the document manually.`
                });
            }
        } catch (e: any) {
            console.error(e);
            setModalConfig({
                type: 'error',
                title: 'Extraction Failed',
                message: `Something went wrong: ${e.message}`
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddressUpdate = () => {
        if (modalConfig?.extractedData?.address) {
            // Simple heuristic split - can be improved
            const parts = modalConfig.extractedData.address.split(' ');
            const houseNumber = parts.pop();
            const street = parts.join(' ');

            // Update first building
            if (buildings.length > 0) {
                updateBuilding(0, { street, houseNumber: houseNumber || '' });
            }

            setModalConfig({
                type: 'success',
                title: 'Address Updated!',
                message: `Building address updated to ${street} ${houseNumber}`
            });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            // Safety: Ensure all rows have required fields before submitting
            const sanitizedRows = rows.map((r: any, i: number) => ({
                ...r,
                // Ensure number is never empty, fallback to index
                number: (r.number && r.number.trim() !== '') ? r.number : `${i + 1}`,
                // Ensure ID is present
                buildingTempId: r.buildingTempId || buildings[0]?.tempId,
                // Ensure Type is valid string
                type: r.type || UnitType.APARTMENT,
                // Ensure numbers are numbers
                size: Number(r.size) || 0,
                coOwnershipShare: Number(r.coOwnershipShare) || 0,
            }));

            // Prepare payload
            const payload = {
                generalInfo,
                buildings,
                units: sanitizedRows,
            };

            // API Call
            const { data, error: apiError } = await client.POST('/properties', {
                body: payload as any // Schema safety handled by sanitization
            });

            if (apiError) {
                // @ts-ignore
                setError(JSON.stringify(apiError)); // Keep stringify for simple state, but parsing handled in render
                setIsSubmitting(false);
                return;
            }

            // Success
            reset();
            router.push('/');
        } catch (e: any) {
            setError(e.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div onPaste={handlePaste} style={{ outline: 'none' }} tabIndex={0}>
            {modalConfig && (
                <Modal
                    title={modalConfig.title}
                    onClose={() => setModalConfig(null)}
                    onConfirm={modalConfig.type === 'confirm' ? runExtraction : (modalConfig.type === 'address-mismatch' ? handleAddressUpdate : undefined)}
                    confirmText={modalConfig.type === 'confirm' ? 'Yes, Replace Rows' : (modalConfig.type === 'address-mismatch' ? 'Update Address' : 'Okay')}
                    cancelText={modalConfig.type === 'address-mismatch' ? 'Keep Current' : 'Cancel'}
                    isSingleAction={modalConfig.type === 'success' || modalConfig.type === 'error'}
                    secondaryText={modalConfig.type === 'address-mismatch' ? undefined : undefined}
                >
                    <div style={{ whiteSpace: 'pre-wrap' }}>{modalConfig.message}</div>
                </Modal>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className={styles.title}>Units Spreadsheet</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {generalInfo.documentId && generalInfo.documentId !== 'mock-doc-id' && (
                        <button
                            type="button"
                            className={`${styles.button}`}
                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', color: 'white' }}
                            onClick={() => {
                                setModalConfig({
                                    type: 'confirm',
                                    title: 'Auto-fill from PDF?',
                                    message: 'This will replace all current rows with data extracted from the uploaded PDF. Any manual changes will be lost. Do you want to continue?'
                                });
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '✨ Extracting...' : '✨ Auto-fill from PDF'}
                        </button>
                    )}
                    <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setRows(prev => [...prev, ...Array.from({ length: 5 }).map(u => ({ ...prev[prev.length - 1] }))])}>
                        Duplicate Last 5
                    </button>
                    <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setRows([])}>
                        Clear
                    </button>
                </div>
            </div>

            {error && (
                <div className={styles.error} style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Please correct the following errors:</div>
                    {(() => {
                        try {
                            const errObj = typeof error === 'string' ? JSON.parse(error) : error;
                            if (errObj.errors && Array.isArray(errObj.errors)) {
                                return (
                                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: 0 }}>
                                        {errObj.errors.map((e: any, i: number) => {
                                            // Format path like "units.0.size" -> "Row 1 - Size"
                                            const pathParts = e.path;
                                            let label = e.path.join('.');
                                            if (pathParts[0] === 'units' && typeof pathParts[1] === 'number') {
                                                label = `Row ${pathParts[1] + 1} - ${pathParts[2]}`;
                                            }
                                            return <li key={i}><strong>{label}:</strong> {e.message}</li>;
                                        })}
                                    </ul>
                                );
                            }
                            return error;
                        } catch (e) {
                            return error;
                        }
                    })()}
                </div>
            )}

            <div className={styles.spreadsheetContainer}>
                {/* Scrollable container for both header and rows */}
                <div style={{ overflowX: 'auto', overflowY: 'auto', height: 550, width: '100%' }}>
                    {/* Header with full-width background */}
                    <div style={{
                        position: 'sticky',
                        top: 0,
                        background: 'hsl(var(--background))',
                        borderBottom: '2px solid hsl(var(--border))',
                        zIndex: 1,
                        paddingBottom: '0.5rem',
                        marginBottom: '0.5rem',
                        width: '100%',
                        minWidth: `${TOTAL_WIDTH}px`
                    }}>
                        <div className={styles.row} style={{
                            fontWeight: 'bold',
                            borderBottom: 'none',
                            paddingBottom: 0,
                            marginBottom: 0,
                            minWidth: `${TOTAL_WIDTH}px`
                        }}>
                            <div style={{ width: COLUMN_WIDTHS[0], flexShrink: 0 }}>Unit</div>
                            <div style={{ width: COLUMN_WIDTHS[1], flexShrink: 0 }}>Type</div>
                            <div style={{ width: COLUMN_WIDTHS[2], flexShrink: 0 }}>Building</div>
                            <div style={{ width: COLUMN_WIDTHS[3], flexShrink: 0 }}>Floor</div>
                            <div style={{ width: COLUMN_WIDTHS[4], flexShrink: 0 }}>Entrance</div>
                            <div style={{ width: COLUMN_WIDTHS[5], flexShrink: 0 }}>Size</div>
                            <div style={{ width: COLUMN_WIDTHS[6], flexShrink: 0 }}>Share</div>
                            <div style={{ width: COLUMN_WIDTHS[7], flexShrink: 0 }}>Year</div>
                            <div style={{ width: COLUMN_WIDTHS[8], flexShrink: 0 }}>Rooms</div>
                            <div style={{ width: COLUMN_WIDTHS[9], flexShrink: 0 }}></div>
                        </div>
                    </div>

                    {/* Data rows */}
                    {rows.map((row, index) => (
                        <UnitRow
                            key={index}
                            index={index}
                            row={row}
                            updateRow={updateRow}
                            deleteRow={deleteRow}
                            buildings={buildings}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.button} onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Property'}
                </button>
            </div>
        </div>
    );
}
