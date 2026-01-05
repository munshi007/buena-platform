import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { buildingSchema } from '@buena/shared';
import { useWizardStore } from '@/store/wizard';
import styles from '../wizard.module.css';
import { useEffect } from 'react';

// Schema for the form (array of buildings)
const stepSchema = z.object({
  buildings: z.array(buildingSchema).min(1, "At least one building is required"),
});

export default function BuildingStep() {
  const { buildings, addBuilding, setStep } = useWizardStore();

  // Initialize form with store data
  const form = useForm({
    resolver: zodResolver(stepSchema),
    defaultValues: { buildings: buildings.length ? buildings : [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "buildings",
  });

  // Auto-sync form changes back to store for persistence (e.g. if user hits "Back")
  const watchedBuildings = form.watch("buildings");
  useEffect(() => {
    if (watchedBuildings && watchedBuildings.length > 0) {
      (useWizardStore as any).setState({ buildings: watchedBuildings });
    }
  }, [watchedBuildings]);

  const onSubmit = (data: any) => {
    (useWizardStore as any).setState({ buildings: data.buildings });
    setStep(3);
  };

  useEffect(() => {
    if (fields.length === 0 && buildings.length === 0) {
      // Add at least one building by default
      append({
        tempId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        street: '',
        houseNumber: '',
        zipMode: '',
        city: ''
      });
    }
  }, [fields.length, buildings.length, append]);

  return (
    <form id="wizard-step-form" onSubmit={form.handleSubmit(onSubmit)}>
      <h2 className={styles.title}>Buildings</h2>
      <p className={styles.cardMeta} style={{ marginBottom: '1.5rem' }}>
        Define the buildings managed under this property.
      </p>

      {fields.map((field, index) => (
        <div key={field.id} className={styles.card} style={{ marginBottom: '1rem' }}>
          <div className={styles.header} style={{ borderBottom: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>
            <h3 className={styles.cardTitle}>Building {index + 1}</h3>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)} className={`${styles.button} ${styles.buttonSecondary}`} style={{ height: '2rem', fontSize: '0.75rem' }}>
                Remove
              </button>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.col} style={{ flex: 2 }}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>Street</label>
                <input {...form.register(`buildings.${index}.street` as const)} className={styles.input} placeholder="Main St" />
                {form.formState.errors.buildings?.[index]?.street && (
                  <p className={styles.error}>{form.formState.errors.buildings[index]?.street?.message}</p>
                )}
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>No.</label>
                <input {...form.register(`buildings.${index}.houseNumber` as const)} className={styles.input} placeholder="12A" />
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>Zip/PLZ</label>
                <input {...form.register(`buildings.${index}.zipMode` as const)} className={styles.input} />
              </div>
            </div>
            <div className={styles.col} style={{ flex: 2 }}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>City</label>
                <input {...form.register(`buildings.${index}.city` as const)} className={styles.input} />
              </div>
            </div>
          </div>
          {/* Hidden tempId */}
          <input type="hidden" {...form.register(`buildings.${index}.tempId` as const)} />
        </div>
      ))}

      <button
        type="button"
        className={`${styles.button} ${styles.buttonSecondary}`}
        style={{ width: '100%' }}
        onClick={() => append({
          tempId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          street: '',
          houseNumber: '',
          zipMode: '',
          city: ''
        })}
      >
        + Add Building
      </button>

      {form.formState.errors.buildings?.root && (
        <p className={styles.error} style={{ marginTop: '1rem' }}>{form.formState.errors.buildings.root.message}</p>
      )}
    </form>
  );
}
