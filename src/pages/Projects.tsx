import React from 'react';
import { FolderOpenIcon, PlusIcon } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Button } from '../components/ui/Button';
import { useStudio } from '../contexts/StudioContext';
import { useOpenProject } from '../hooks/useOpenProject';

export function Projects() {
  const { projects, project: current, loading, renameProject, duplicateProject, removeProject } = useStudio();
  const nav = useOpenProject();

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader
        title="My Projects"
        description="Saved automatically in this browser. Projects don't sync between devices, and clearing site data removes them."
        actions={
        <Button variant="primary" onClick={() => nav.startNew()}>
            <PlusIcon className="h-4 w-4" aria-hidden /> New slideshow
          </Button>
        } />
      

      {loading ?
      <p className="mt-10 text-sm text-ink-muted" role="status">
          Loading projects…
        </p> :
      projects.length === 0 ?
      <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
          <FolderOpenIcon className="h-6 w-6 text-ink-subtle" aria-hidden />
          <h2 className="mt-3 text-sm font-medium text-ink">No saved projects yet</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Projects appear here as soon as you enter a topic or add slides.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={() => nav.startNew()}>
              Start a slideshow
            </Button>
            <Button variant="secondary" onClick={nav.openSample}>
              Open the sample
            </Button>
          </div>
        </div> :

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) =>
        <li key={p.id} className="flex">
              <div className="w-full">
                <ProjectCard
              project={p}
              isCurrent={current?.id === p.id}
              onOpen={() => void nav.open(p.id)}
              onRename={(name) => void renameProject(p.id, name)}
              onDuplicate={() => void duplicateProject(p.id)}
              onDelete={() => void removeProject(p.id)} />
            
              </div>
            </li>
        )}
        </ul>
      }
    </div>);

}