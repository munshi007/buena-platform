import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    ManagementType,
    UnitType,
    createUnitSchema,
} from '@buena/shared';
import { z } from 'zod';
import { createPropertySchema } from '@buena/shared';

type CreatePropertyState = z.infer<typeof createPropertySchema>;

interface WizardStore extends CreatePropertyState {
    step: number;
    draftId: string | null;
    setStep: (step: number) => void;
    setDraftId: (id: string | null) => void;
    setGeneralInfo: (info: Partial<CreatePropertyState['generalInfo']>) => void;
    addBuilding: (building: CreatePropertyState['buildings'][0]) => void;
    updateBuilding: (index: number, building: Partial<CreatePropertyState['buildings'][0]>) => void;
    setBuildings: (buildings: CreatePropertyState['buildings']) => void;
    setUnits: (units: CreatePropertyState['units']) => void;
    reset: () => void;
}

const initialState: CreatePropertyState = {
    generalInfo: {
        name: '',
        managementType: ManagementType.WEG,
    },
    buildings: [],
    units: [],
};

export const useWizardStore = create<WizardStore>()(
    persist(
        (set) => ({
            ...initialState,
            step: 1,
            draftId: null,
            setStep: (step) => set({ step }),
            setDraftId: (draftId) => set({ draftId }),
            setGeneralInfo: (info) => set((state) => ({
                generalInfo: { ...state.generalInfo, ...info }
            })),
            addBuilding: (building) => set((state) => ({
                buildings: [...state.buildings, building]
            })),
            updateBuilding: (index, field) => set((state) => {
                const buildings = [...state.buildings];
                buildings[index] = { ...buildings[index], ...field };
                return { buildings };
            }),
            setBuildings: (buildings) => set({ buildings }), // Implementation
            setUnits: (units) => set({ units }),
            reset: () => set({ ...initialState, step: 1, draftId: null }),
        }),
        {
            name: 'property-wizard-storage',
        }
    )
);
