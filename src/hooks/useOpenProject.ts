import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGeneration } from '../contexts/GenerationContext';
import { useStudio } from '../contexts/StudioContext';
import type { ThemeId } from '../types/slides';

/** Navigation helpers that respect a running generation. */
export function useOpenProject() {
  const studio = useStudio();
  const gen = useGeneration();
  const navigate = useNavigate();

  const guard = () => {
    if (gen.isRunning) {
      toast.error('Finish or cancel the current generation first.');
      return false;
    }
    gen.reset();
    return true;
  };

  return {
    open: async (id: string) => {
      if (studio.project?.id === id) {
        navigate('/studio');
        return;
      }
      if (!guard()) return;
      await studio.openProject(id);
      navigate('/studio');
    },
    startNew: (init: {topic?: string;themeId?: ThemeId;} = {}) => {
      if (!guard()) return;
      studio.createNewProject(init);
      navigate('/studio');
    },
    openSample: () => {
      if (!guard()) return;
      studio.loadSample();
      navigate('/studio');
    }
  };
}