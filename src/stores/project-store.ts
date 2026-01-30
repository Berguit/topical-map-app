import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, TopicalMapNode, TopicalMapEdge } from '@/types';

interface ProjectState {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Current project
  currentProject: Project | null;

  // Projects list (for MVP, stored locally)
  projects: Project[];

  // Actions
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Topical Map actions
  addNode: (node: TopicalMapNode) => void;
  updateNode: (nodeId: string, updates: Partial<TopicalMapNode>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: TopicalMapEdge) => void;
  deleteEdge: (edgeId: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      currentProject: null,
      projects: [],

      setCurrentProject: (project) => set({ currentProject: project }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
          currentProject: project,
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: new Date() }
              : state.currentProject,
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
        })),

      // Topical Map actions
      addNode: (node) =>
        set((state) => {
          if (!state.currentProject?.topicalMap) return state;
          return {
            currentProject: {
              ...state.currentProject,
              topicalMap: {
                ...state.currentProject.topicalMap,
                nodes: [...state.currentProject.topicalMap.nodes, node],
              },
            },
          };
        }),

      updateNode: (nodeId, updates) =>
        set((state) => {
          if (!state.currentProject?.topicalMap) return state;
          return {
            currentProject: {
              ...state.currentProject,
              topicalMap: {
                ...state.currentProject.topicalMap,
                nodes: state.currentProject.topicalMap.nodes.map((n) =>
                  n.id === nodeId ? { ...n, ...updates } : n
                ),
              },
            },
          };
        }),

      deleteNode: (nodeId) =>
        set((state) => {
          if (!state.currentProject?.topicalMap) return state;
          return {
            currentProject: {
              ...state.currentProject,
              topicalMap: {
                ...state.currentProject.topicalMap,
                nodes: state.currentProject.topicalMap.nodes.filter(
                  (n) => n.id !== nodeId
                ),
                // Also remove edges connected to this node
                edges: state.currentProject.topicalMap.edges.filter(
                  (e) => e.source !== nodeId && e.target !== nodeId
                ),
              },
            },
          };
        }),

      addEdge: (edge) =>
        set((state) => {
          if (!state.currentProject?.topicalMap) return state;
          return {
            currentProject: {
              ...state.currentProject,
              topicalMap: {
                ...state.currentProject.topicalMap,
                edges: [...state.currentProject.topicalMap.edges, edge],
              },
            },
          };
        }),

      deleteEdge: (edgeId) =>
        set((state) => {
          if (!state.currentProject?.topicalMap) return state;
          return {
            currentProject: {
              ...state.currentProject,
              topicalMap: {
                ...state.currentProject.topicalMap,
                edges: state.currentProject.topicalMap.edges.filter(
                  (e) => e.id !== edgeId
                ),
              },
            },
          };
        }),
    }),
    {
      name: 'topical-map-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Hook to wait for hydration
export const useHydration = () => {
  return useProjectStore((state) => state._hasHydrated);
};
