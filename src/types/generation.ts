export type StageId = 'analyze' | 'script' | 'prompts' | 'images' | 'typography' | 'quality' | 'export';

export type StageStatus = 'pending' | 'running' | 'done' | 'partial' | 'skipped' | 'failed' | 'cancelled';

export interface StageState {
  status: StageStatus;
  detail?: string;
}

export type PipelineStatus = 'idle' | 'running' | 'done' | 'failed' | 'cancelled';

export type SlideJobStatus = 'pending' | 'running' | 'done' | 'failed';

export type SlideBusy = 'text' | 'image' | 'shorten';

export interface PipelineState {
  status: PipelineStatus;
  projectId: string | null;
  stages: Record<StageId, StageState>;
  slideJobs: Record<string, SlideJobStatus>;
  activeSlideId: string | null;
  error: string | null;
  panelOpen: boolean;
}