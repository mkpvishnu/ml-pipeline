import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { Group, Module, Canvas, Run } from '../services/api';

interface AppState {
  // UI State
  selectedModuleId: string | null;
  selectedCanvasId: string | null;
  isSettingsOpen: boolean;
  isBottomPanelExpanded: boolean;
  activeBottomTab: 'logs' | 'history' | 'preview';
  
  // Data
  groups: Group[];
  canvases: Canvas[];
  currentCanvas: Canvas | null;
  runs: Record<string, Run>;
  
  // Loading States
  loadingStates: Record<string, boolean>;
  
  // Actions
  setSelectedModule: (moduleId: string | null) => void;
  setSelectedCanvas: (canvasId: string | null) => void;
  toggleSettings: () => void;
  toggleBottomPanel: () => void;
  setActiveBottomTab: (tab: 'logs' | 'history' | 'preview') => void;
  
  // Data Actions
  setGroups: (groups: Group[]) => void;
  updateGroup: (groupId: string, group: Partial<Group>) => void;
  deleteGroup: (groupId: string) => void;
  
  setCanvases: (canvases: Canvas[]) => void;
  setCurrentCanvas: (canvas: Canvas | null) => void;
  updateCanvas: (canvasId: string, canvas: Partial<Canvas>) => void;
  deleteCanvas: (canvasId: string) => void;
  
  updateModule: (moduleId: string, module: Partial<Module>) => void;
  deleteModule: (groupId: string, moduleId: string) => void;
  
  addRun: (run: Run) => void;
  updateRun: (runId: string, run: Partial<Run>) => void;
  
  setLoading: (key: string, isLoading: boolean) => void;
}

const useStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial UI State
      selectedModuleId: null,
      selectedCanvasId: null,
      isSettingsOpen: false,
      isBottomPanelExpanded: false,
      activeBottomTab: 'logs',
      
      // Initial Data
      groups: [],
      canvases: [],
      currentCanvas: null,
      runs: {},
      
      // Loading States
      loadingStates: {},
      
      // UI Actions
      setSelectedModule: (moduleId) => 
        set({ selectedModuleId: moduleId, isSettingsOpen: !!moduleId }),
      
      setSelectedCanvas: (canvasId) =>
        set({ selectedCanvasId: canvasId }),
      
      toggleSettings: () => 
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      
      toggleBottomPanel: () => 
        set((state) => ({ isBottomPanelExpanded: !state.isBottomPanelExpanded })),
      
      setActiveBottomTab: (tab) => 
        set({ activeBottomTab: tab }),
      
      // Data Actions
      setGroups: (groups) => 
        set({ groups }),
      
      updateGroup: (groupId, groupUpdate) =>
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId ? { ...group, ...groupUpdate } : group
          )
        })),
      
      deleteGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter(group => group.id !== groupId)
        })),
      
      setCanvases: (canvases) =>
        set({ canvases }),
      
      setCurrentCanvas: (canvas) =>
        set({ currentCanvas: canvas }),
      
      updateCanvas: (canvasId, canvasUpdate) =>
        set((state) => ({
          canvases: state.canvases.map(canvas =>
            canvas.id === canvasId ? { ...canvas, ...canvasUpdate } : canvas
          ),
          currentCanvas: state.currentCanvas?.id === canvasId
            ? { ...state.currentCanvas, ...canvasUpdate }
            : state.currentCanvas
        })),
      
      deleteCanvas: (canvasId) =>
        set((state) => ({
          canvases: state.canvases.filter(canvas => canvas.id !== canvasId),
          currentCanvas: state.currentCanvas?.id === canvasId ? null : state.currentCanvas
        })),
      
      updateModule: (moduleId, moduleUpdate) =>
        set((state) => ({
          groups: state.groups.map(group => ({
            ...group,
            modules: group.modules.map(module =>
              module.id === moduleId ? { ...module, ...moduleUpdate } : module
            )
          }))
        })),
      
      deleteModule: (groupId, moduleId) =>
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId
              ? {
                  ...group,
                  modules: group.modules.filter(module => module.id !== moduleId)
                }
              : group
          )
        })),
      
      addRun: (run) =>
        set((state) => ({
          runs: { ...state.runs, [run.id]: run }
        })),
      
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