import React from 'react';
import { FileTextIcon, KeyRoundIcon, PlayCircleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudio } from '../../contexts/StudioContext';
import { createBlankSlides } from '../../utils/project';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface ConnectionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ConnectionDialog({ open, onClose }: ConnectionDialogProps) {
  const navigate = useNavigate();
  const { update, loadSample } = useStudio();

  const options = [
  {
    icon: KeyRoundIcon,
    title: 'Connect Gemini',
    text: 'Deploy a small Netlify function that holds your API key on the server. About 5 minutes.',
    action: 'Open setup',
    primary: true,
    run: () => {
      onClose();
      navigate('/settings');
    }
  },
  {
    icon: FileTextIcon,
    title: 'Write it yourself',
    text: 'Create empty slides from your settings and fill in the text. Everything else works the same.',
    action: 'Start blank',
    primary: false,
    run: () => {
      update((p) => ({ ...p, slides: createBlankSlides(p) }), { key: 'blank-slides' });
      onClose();
    }
  },
  {
    icon: PlayCircleIcon,
    title: 'Explore the sample',
    text: 'Open a finished example to try the editor. It is clearly marked as a sample.',
    action: 'Open sample',
    primary: false,
    run: () => {
      loadSample();
      onClose();
    }
  }];


  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gemini isn't connected yet"
      description="Script generation runs through a secure server function so your API key never reaches the browser.">
      
      <ul className="divide-y divide-line">
        {options.map((o) => {
          const Icon = o.icon;
          return (
            <li key={o.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                <Icon className="h-4 w-4 text-ink-muted" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{o.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{o.text}</p>
              </div>
              <Button size="sm" variant={o.primary ? 'primary' : 'secondary'} onClick={o.run} className="shrink-0">
                {o.action}
              </Button>
            </li>);

        })}
      </ul>
    </Modal>);

}