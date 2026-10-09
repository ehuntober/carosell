import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useProjectHistory, type ProjectUpdater } from '../hooks/useProjectHistory';
import type { SaveStatus } from '../types/editor';
import type { Project, Slide, ThemeId } from '../types/slides';
import { createProject, createSampleProject, uid } from '../utils/project';
import {
  clearAllProjects,
  deleteStoredProject,
  getLastProjectId,
  listProjects,
  loadProject,
  saveProject,
  setLastProjectId } from
'../utils/storage';
import { useSettings } from './SettingsContext';

interface UpdateOptions {
  key?: string;
  record?: boolean;
}

interface StudioValue {
  project: Project | null;
  projects: Project[];
  loading: boolean;
  saveStatus: SaveStatus;
  selectedSlideId: string | null;
  selectSlide: (id: string | null) => void;
  getProject: () => Project | null;
  update: (updater: ProjectUpdater, opts?: UpdateOptions) => void;
  updateSlide: (id: string, patch: Partial<Slide> | ((s: Slide) => Slide), opts?: UpdateOptions) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  createNewProject: (init?: {topic?: string;themeId?: ThemeId;}) => Project;
  openProject: (id: string) => Promise<void>;
  loadSample: () => void;
  renameProject: (id: string, name: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<Project | null>;
  removeProject: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const StudioContext = createContext<StudioValue | null>(null);

function shouldPersist(p: Project): boolean {
  return p.slides.length > 0 || p.content.topic.trim().length > 0;
}

export function StudioProvider({ children }: {children: React.ReactNode;}) {
  const { brandKit } = useSettings();
  const history = useProjectHistory();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const presentRef = useRef<Project | null>(null);
  const lastSavedRef = useRef<number>(0);
  const brandRef = useRef(brandKit);
  brandRef.current = brandKit;
  presentRef.current = history.present;

  const { load } = history;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await listProjects();
        if (!alive) return;
        setProjects(list);
        const lastId = getLastProjectId();
        const last = lastId && list.find((p) => p.id === lastId) || null;
        const project = last ?? createProject(brandRef.current);
        lastSavedRef.current = project.updatedAt;
        load(project);
        setSelectedSlideId(project.slides[0]?.id ?? null);
        if (last) setSaveStatus('saved');
      } catch {
        load(createProject(brandRef.current));
        setSaveStatus('error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  const present = history.present;
  useEffect(() => {
    if (!present || loading) return;
    if (present.updatedAt === lastSavedRef.current || !shouldPersist(present)) return;
    setSaveStatus('saving');
    const t = window.setTimeout(async () => {
      try {
        await saveProject(present);
        lastSavedRef.current = present.updatedAt;
        setLastProjectId(present.id);
        setProjects((prev) => [present, ...prev.filter((p) => p.id !== present.id)]);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [present, loading]);

  const getProject = useCallback(() => presentRef.current, []);

  const update = useCallback(
    (updater: ProjectUpdater, opts: UpdateOptions = {}) => {
      // Mirror synchronously so async flows read fresh state before React re-renders.
      if (presentRef.current) presentRef.current = updater(presentRef.current);
      history.update(updater, opts.key, opts.record ?? true);
    },
    [history.update]
  );

  const updateSlide = useCallback(
    (id: string, patch: Partial<Slide> | ((s: Slide) => Slide), opts?: UpdateOptions) => {
      update(
        (p) => ({
          ...p,
          slides: p.slides.map((s) => s.id === id ? typeof patch === 'function' ? patch(s) : { ...s, ...patch } : s)
        }),
        opts
      );
    },
    [update]
  );

  const activate = useCallback(
    (project: Project, persisted: boolean) => {
      lastSavedRef.current = persisted ? project.updatedAt : 0;
      load(project);
      setSelectedSlideId(project.slides[0]?.id ?? null);
      setSaveStatus(persisted ? 'saved' : 'idle');
      if (persisted) setLastProjectId(project.id);
    },
    [load]
  );

  const createNewProject = useCallback(
    (init: {topic?: string;themeId?: ThemeId;} = {}) => {
      const project = createProject(brandRef.current, init);
      activate(project, !init.topic);
      return project;
    },
    [activate]
  );

  const openProject = useCallback(
    async (id: string) => {
      const project = projects.find((p) => p.id === id) ?? (await loadProject(id));
      if (!project) {
        toast.error('That project could not be found in this browser.');
        return;
      }
      activate(project, true);
    },
    [projects, activate]
  );

  const loadSample = useCallback(() => activate(createSampleProject(), false), [activate]);

  const renameProject = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim() || 'Untitled slideshow';
      if (presentRef.current?.id === id) {
        update((p) => ({ ...p, name: trimmed }), { key: 'rename' });
        return;
      }
      const stored = projects.find((p) => p.id === id);
      if (!stored) return;
      const next = { ...stored, name: trimmed, updatedAt: Date.now() };
      await saveProject(next);
      setProjects((prev) => prev.map((p) => p.id === id ? next : p));
    },
    [projects, update]
  );

  const duplicateProject = useCallback(
    async (id: string) => {
      const source = presentRef.current?.id === id ? presentRef.current : projects.find((p) => p.id === id);
      if (!source) return null;
      const now = Date.now();
      const copy: Project = {
        ...source,
        id: uid('proj'),
        name: `${source.name} (copy)`,
        createdAt: now,
        updatedAt: now,
        slides: source.slides.map((s) => ({ ...s, id: uid('slide') }))
      };
      try {
        await saveProject(copy);
        setProjects((prev) => [copy, ...prev]);
        toast.success('Project duplicated');
        return copy;
      } catch {
        toast.error('Could not duplicate — browser storage may be full.');
        return null;
      }
    },
    [projects]
  );

  const removeProject = useCallback(
    async (id: string) => {
      await deleteStoredProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (presentRef.current?.id === id) {
        setLastProjectId(null);
        activate(createProject(brandRef.current), false);
      }
    },
    [activate]
  );

  const clearAll = useCallback(async () => {
    await clearAllProjects();
    setProjects([]);
    setLastProjectId(null);
    activate(createProject(brandRef.current), false);
  }, [activate]);

  const value = useMemo<StudioValue>(
    () => ({
      project: history.present,
      projects,
      loading,
      saveStatus,
      selectedSlideId,
      selectSlide: setSelectedSlideId,
      getProject,
      update,
      updateSlide,
      undo: history.undo,
      redo: history.redo,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      createNewProject,
      openProject,
      loadSample,
      renameProject,
      duplicateProject,
      removeProject,
      clearAll
    }),
    [
    history.present,
    history.undo,
    history.redo,
    history.canUndo,
    history.canRedo,
    projects,
    loading,
    saveStatus,
    selectedSlideId,
    getProject,
    update,
    updateSlide,
    createNewProject,
    openProject,
    loadSample,
    renameProject,
    duplicateProject,
    removeProject,
    clearAll]

  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider');
  return ctx;
}