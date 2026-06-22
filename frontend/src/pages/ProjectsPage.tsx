import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Flag } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import { Project } from '@/types';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectsApi.getAll();
        setProjects(res.data.data);
      } catch (error) {
        toast('Failed to load projects', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [toast]);

  if (isLoading) {
    return <div className="p-8">Loading projects...</div>;
  }

  // Mock progress data for visual fidelity with screenshot
  const mockProgress: Record<number, number> = {
    1: 68,
    2: 34,
    3: 100,
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-8">
      {/* Header Area */}
      <div className="flex justify-between items-start bg-white rounded-t-xl -mx-8 -mt-8 p-8 border-b border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#A5C0F3]">Projects</h1>
          <p className="text-[#94A3B8] mt-1 font-medium">Manage and track your active initiatives.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              className="block w-64 pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-bg text-white placeholder-text-muted focus:outline-none focus:border-accent sm:text-sm"
              placeholder="Search projects..."
            />
          </div>
          <Button variant="ghost" className="text-black hover:bg-black/5 font-semibold text-base">
            <Plus className="w-5 h-5 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {projects.map((project) => (
          <div 
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="glass-panel p-6 cursor-pointer hover:border-text-muted transition-colors flex flex-col h-full"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white truncate pr-4">{project.name}</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/20 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span className="text-[10px] font-bold text-[#10B981] tracking-wider">ACTIVE</span>
              </div>
            </div>

            {/* Manager Info */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-white">
                {project.ownerName ? project.ownerName[0].toUpperCase() : 'U'}
              </div>
              <span className="text-sm text-text-muted">
                Manager: <span className="text-white font-medium">{project.ownerName || 'Unassigned'}</span>
              </span>
            </div>

            <div className="mt-auto">
              {/* Progress */}
              <div className="flex justify-between text-xs font-medium mb-2 text-text-muted">
                <span>Progress</span>
                <span className="text-white">{mockProgress[project.id as number] || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-3 rounded-full mb-6 overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full" 
                  style={{ width: `${mockProgress[project.id as number] || 0}%` }}
                />
              </div>

              {/* Dates */}
              <div className="flex justify-between items-center text-xs text-text-muted pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Oct 12</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" />
                  <span>Dec 30</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
