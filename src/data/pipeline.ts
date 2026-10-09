import type { StageId } from '../types/generation';

export const stages: {id: StageId;label: string;}[] = [
{ id: 'analyze', label: 'Analyzing topic' },
{ id: 'script', label: 'Writing slide content' },
{ id: 'prompts', label: 'Creating image prompts' },
{ id: 'images', label: 'Generating backgrounds' },
{ id: 'typography', label: 'Applying typography and layouts' },
{ id: 'quality', label: 'Checking quality' },
{ id: 'export', label: 'Preparing exports' }];


export const workflowSteps = ['Idea', 'Script', 'Images', 'Design', 'Export'];