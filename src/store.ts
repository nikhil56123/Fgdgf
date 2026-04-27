import { create } from 'zustand';

export interface Voxel {
  id: string;
  position: [number, number, number];
  color: string;
}

export interface ModFile {
  name: string;
  content: string;
  language: 'java' | 'json';
}

export type ModLoader = 'forge' | 'fabric' | 'neoforge' | 'quilt';

export interface ModProject {
  id: string;
  name: string;
  version: string;
  mcVersion: string;
  modType: ModLoader;
  files: ModFile[];
  models: {
    [key: string]: Voxel[];
  };
}

interface ProjectState {
  project: ModProject | null;
  activeFile: string | null;
  activeModel: string | null;
  setProject: (project: ModProject) => void;
  updateFile: (name: string, content: string) => void;
  addFile: (file: ModFile) => void;
  updateModel: (name: string, voxels: Voxel[]) => void;
  addModel: (name: string) => void;
  updateProjectMetadata: (metadata: Partial<Pick<ModProject, 'name' | 'version' | 'mcVersion'>>) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  activeFile: null,
  activeModel: null,
  setProject: (project) => set({ project, activeFile: project.files[0]?.name || null }),
  updateFile: (name, content) => set((state) => {
    if (!state.project) return state;
    const newFiles = state.project.files.map(f => f.name === name ? { ...f, content } : f);
    return { project: { ...state.project, files: newFiles } };
  }),
  addFile: (file) => set((state) => {
    if (!state.project) return state;
    return { project: { ...state.project, files: [...state.project.files, file] }, activeFile: file.name };
  }),
  updateModel: (name, voxels) => set((state) => {
    if (!state.project) return state;
    return { project: { ...state.project, models: { ...state.project.models, [name]: voxels } } };
  }),
  addModel: (name) => set((state) => {
    if (!state.project) return state;
    return { project: { ...state.project, models: { ...state.project.models, [name]: [] } }, activeModel: name };
  }),
  updateProjectMetadata: (metadata) => set((state) => {
    if (!state.project) return state;
    return { project: { ...state.project, ...metadata } };
  }),
}));
