import { del, get, getMany, keys, set } from 'idb-keyval';
import type { Project } from '../types/slides';

const PROJECT_PREFIX = 'carosell.project.';
const LAST_PROJECT_KEY = 'carosell.lastProjectId';

export async function saveProject(project: Project): Promise<void> {
  await set(PROJECT_PREFIX + project.id, project);
}

export async function loadProject(id: string): Promise<Project | null> {
  return (await get<Project>(PROJECT_PREFIX + id)) ?? null;
}

export async function listProjects(): Promise<Project[]> {
  const all = (await keys()).filter((k): k is string => typeof k === 'string' && k.startsWith(PROJECT_PREFIX));
  const projects = await getMany<Project | undefined>(all);
  return projects.filter((p): p is Project => Boolean(p)).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteStoredProject(id: string): Promise<void> {
  await del(PROJECT_PREFIX + id);
}

export async function clearAllProjects(): Promise<void> {
  const all = (await keys()).filter((k): k is string => typeof k === 'string' && k.startsWith(PROJECT_PREFIX));
  await Promise.all(all.map((k) => del(k)));
}

export function getLastProjectId(): string | null {
  try {
    return localStorage.getItem(LAST_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function setLastProjectId(id: string | null) {
  try {
    if (id) localStorage.setItem(LAST_PROJECT_KEY, id);else
    localStorage.removeItem(LAST_PROJECT_KEY);
  } catch {

    // Storage may be disabled (private mode); the app keeps working in memory.
  }}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {

    // Ignore quota / privacy-mode errors.
  }}