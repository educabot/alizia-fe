import { create } from 'zustand';
import type { Moments, ResourcesMode } from '@/types';

interface LessonWizardData {
  step: number;
  classNumber: number | null;
  title: string;
  topicIds: number[];
  objective: string;
  knowledgeContent: string;
  didacticStrategies: string;
  classFormat: string;
  moments: Moments;
  customInstruction: string;
  resourcesMode: ResourcesMode;
  globalFontId: number | null;
  momentFontIds: { apertura: number | null; desarrollo: number | null; cierre: number | null };
}

const initialLessonWizardData: LessonWizardData = {
  step: 1,
  classNumber: null,
  title: '',
  topicIds: [],
  objective: '',
  knowledgeContent: '',
  didacticStrategies: '',
  classFormat: '',
  moments: {
    apertura: { activities: [], activityContent: {} },
    desarrollo: { activities: [], activityContent: {} },
    cierre: { activities: [], activityContent: {} },
  },
  customInstruction: '',
  resourcesMode: 'global',
  globalFontId: null,
  momentFontIds: { apertura: null, desarrollo: null, cierre: null },
};

interface TeachingState {
  lessonWizardData: LessonWizardData;

  updateLessonWizardData: (data: Partial<LessonWizardData>) => void;
  resetLessonWizardData: () => void;
}

export const useTeachingStore = create<TeachingState>((set) => ({
  lessonWizardData: { ...initialLessonWizardData },

  updateLessonWizardData: (data) => set((state) => ({ lessonWizardData: { ...state.lessonWizardData, ...data } })),
  resetLessonWizardData: () => set({ lessonWizardData: { ...initialLessonWizardData } }),
}));
