import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface Module {
  id: string;
  name: string;
  identifier: string;
  config_schema: Record<string, any>;
  user_config: Record<string, any>;
}

interface Group {
  id: string;
  name: string;
  modules: Module[];
}

interface Canvas {
  id: string;
  name: string;
  module_config: {
    nodes: any[];
    edges: any[];
  };
}

interface Run {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  results?: any;
  logs: string[];
}

interface AppState {
  // UI State
  selectedModuleId: string | null;
  isSettingsOpen: boolean;
  isBottomPanelExpanded: boolean;
  activeBottomTab: 'logs' | 'history' | 'preview';
  
  // Data
  groups: Group[];
  currentCanvas: Canvas | null;
  runs: Record<string, Run>;
  
  // Loading States
  isLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Actions
  setSelectedModule: (moduleId: string | null) => void;
  toggleSettings: () => void;
  toggleBottomPanel: () => void;
  setActiveBottomTab: (tab: 'logs' | 'history' | 'preview') => void;
  setGroups: (groups: Group[]) => void;
  setCurrentCanvas: (canvas: Canvas | null) => void;
  updateRun: (runId: string, run: Partial<Run>) => void;
  setLoading: (key: string, isLoading: boolean) => void;
}

const useStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial UI State
      selectedModuleId: null,
      isSettingsOpen: false,
      isBottomPanelExpanded: false,
      activeBottomTab: 'logs',
      
      // Initial Data
      groups: [],
      currentCanvas: null,
      runs: {},
      
      // Loading States
      isLoading: false,
      loadingStates: {},
      
      // Actions
      setSelectedModule: (moduleId) => 
        set({ selectedModuleId: moduleId, isSettingsOpen: !!moduleId }),
      
      toggleSettings: () => 
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      
      toggleBottomPanel: () => 
        set((state) => ({ isBottomPanelExpanded: !state.isBottomPanelExpanded })),
      
      setActiveBottomTab: (tab) => 
        set({ activeBottomTab: tab }),
      
      setGroups: (groups) => 
        set({ groups }),
      
      setCurrentCanvas: (canvas) => 
        set({ currentCanvas: canvas }),
      
      updateRun: (runId, runUpdate) => 
        set((state) => ({
          runs: {
            ...state.runs,
            [runId]: { ...state.runs[runId], ...runUpdate }
          }
        })),
      
      setLoading: (key, isLoading) => 
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: isLoading
          }
        })),
    })
  )
);

export default useStore; 