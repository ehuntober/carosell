import { useCallback, useReducer } from 'react';
import type { Project } from '../types/slides';

export type ProjectUpdater = (project: Project) => Project;

interface HistoryState {
  past: Project[];
  present: Project | null;
  future: Project[];
  lastKey: string | null;
  lastAt: number;
}

type Action =
{type: 'load';project: Project;} |
{type: 'update';updater: ProjectUpdater;key?: string;record: boolean;} |
{type: 'undo';} |
{type: 'redo';};

const LIMIT = 60;
const COALESCE_MS = 1200;

function reducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case 'load':
      return { past: [], present: action.project, future: [], lastKey: null, lastAt: 0 };
    case 'update':{
        if (!state.present) return state;
        const now = Date.now();
        const next = { ...action.updater(state.present), updatedAt: now };
        if (!action.record) {
          // Background changes (e.g. images arriving) are applied to every snapshot,
          // so undoing an unrelated edit never makes a finished image disappear.
          return {
            ...state,
            past: state.past.map(action.updater),
            future: state.future.map(action.updater),
            present: next
          };
        }
        if (action.key && action.key === state.lastKey && now - state.lastAt < COALESCE_MS) {
          return { ...state, present: next, future: [], lastAt: now };
        }
        return {
          past: [...state.past, state.present].slice(-LIMIT),
          present: next,
          future: [],
          lastKey: action.key ?? null,
          lastAt: now
        };
      }
    case 'undo':{
        if (!state.present || !state.past.length) return state;
        const previous = state.past[state.past.length - 1];
        return {
          past: state.past.slice(0, -1),
          present: { ...previous, updatedAt: Date.now() },
          future: [state.present, ...state.future],
          lastKey: null,
          lastAt: 0
        };
      }
    case 'redo':{
        if (!state.present || !state.future.length) return state;
        const [next, ...rest] = state.future;
        return {
          past: [...state.past, state.present],
          present: { ...next, updatedAt: Date.now() },
          future: rest,
          lastKey: null,
          lastAt: 0
        };
      }
    default:
      return state;
  }
}

export function useProjectHistory() {
  const [state, dispatch] = useReducer(reducer, { past: [], present: null, future: [], lastKey: null, lastAt: 0 });

  const load = useCallback((project: Project) => dispatch({ type: 'load', project }), []);
  const update = useCallback(
    (updater: ProjectUpdater, key: string | undefined, record: boolean) =>
    dispatch({ type: 'update', updater, key, record }),
    []
  );
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  return {
    present: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    load,
    update,
    undo,
    redo
  };
}