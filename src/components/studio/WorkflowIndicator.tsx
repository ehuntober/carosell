import React from 'react';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { workflowSteps } from '../../data/pipeline';

interface WorkflowIndicatorProps {
  current: number;
  className?: string;
}

export function WorkflowIndicator({ current, className }: WorkflowIndicatorProps) {
  return (
    <ol aria-label="Workflow" className={`scrollbar-thin flex items-center gap-2 overflow-x-auto text-xs ${className ?? ''}`}>
      {workflowSteps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'next';
        return (
          <li key={step} className="flex shrink-0 items-center gap-2">
            {i > 0 && <ArrowRightIcon className="h-3 w-3 text-ink-subtle" aria-hidden />}
            <span
              aria-current={state === 'current' ? 'step' : undefined}
              className={`flex items-center gap-1.5 ${state === 'next' ? 'text-ink-subtle' : 'text-ink'} ${state === 'current' ? 'font-medium' : ''}`}>
              
              <span
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
                state === 'current' ?
                'bg-accent text-white' :
                state === 'done' ?
                'bg-surface-3 text-ink' :
                'border border-line-strong text-ink-subtle'}`
                }>
                
                {state === 'done' ? <CheckIcon className="h-3 w-3" aria-hidden /> : i + 1}
              </span>
              {step}
              {state === 'done' && <span className="sr-only">(complete)</span>}
            </span>
          </li>);

      })}
    </ol>);

}