import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import { Project } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ProjectStatusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const fetchProjects = async (p = 0) => {
    try {
      setIsLoading(true);
      const res = await projectsApi.list(p, 12);
      setProjects(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (error) {
      toast('Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await projectsApi.create({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        status: 'ACTIVE',
        startDate: null,
        endDate: null,
      });
      setIsCreateOpen(false);
      toast('Project created successfully', 'success');
      fetchProjects(0);
    } catch (error) {
      toast('Failed to create project', 'error');
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editProject) return;
    const formData = new FormData(e.currentTarget);
    try {
      await projectsApi.update(editProject.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        status: editProject.status,
        startDate: editProject.startDate,
        endDate: editProject.endDate,
      });
      setEditProject(null);
      toast('Project updated', 'success');
      fetchProjects(page);
    } catch (error) {
      toast('Failed to update project', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteProject) return;
    try {
      await projectsApi.delete(deleteProject.id);
      setDeleteProject(null);
      toast('Project deleted', 'success');
      fetchProjects(page);
    } catch (error) {
      toast('Failed to delete project', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text">Projects</h1>
          <p className="text-text-muted mt-1">Manage all your active projects and boards</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-6 h-[200px] flex flex-col justify-between">
              <div>
                <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                <Skeleton variant="text" className="w-3/4 mb-2" />
                <Skeleton variant="text" className="w-full h-10" />
              </div>
              <Skeleton variant="text" className="w-1/3" />
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="You haven't created any projects yet. Get started by creating your first project board."
          action={<Button onClick={() => setIsCreateOpen(true)}>Create Project</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((p) => (
              <Card key={p.id} hover className="p-6 flex flex-col cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div className="relative group" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-bg-surface2 focus-visible:ring-2 focus-visible:ring-accent outline-none">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-bg-surface border border-border rounded-lg shadow-card hidden group-hover:block z-10 min-w-[120px] overflow-hidden">
                      <button
                        onClick={() => setEditProject(p)}
                        className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg-surface2 flex items-center focus-visible:bg-bg-surface2 outline-none"
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteProject(p)}
                        className="w-full text-left px-4 py-2 text-sm text-status-critical hover:bg-status-critical/10 flex items-center focus-visible:bg-status-critical/10 outline-none"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg text-text mb-2 line-clamp-1">{p.name}</h3>
                <p className="text-sm text-text-muted line-clamp-2 mb-6 flex-1">
                  {p.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <ProjectStatusBadge status="ACTIVE" />
                  <span className="text-xs text-text-muted font-medium">Owner</span>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-text-muted">Page {page + 1} of {totalPages}</span>
              <Button
                variant="secondary"
                disabled={page === totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Project Name" name="name" required placeholder="e.g. Website Redesign" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea
              name="description"
              className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2.5 text-text text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent hover:border-accent/50 placeholder:text-text-muted/50"
              rows={3}
              placeholder="Briefly describe the project..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        {editProject && (
          <form onSubmit={handleEdit} className="space-y-4">
            <Input label="Project Name" name="name" defaultValue={editProject.name} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">Description</label>
              <textarea
                name="description"
                defaultValue={editProject.description}
                className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2.5 text-text text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent hover:border-accent/50 placeholder:text-text-muted/50"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setEditProject(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteProject} onClose={() => setDeleteProject(null)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to delete <span className="font-semibold text-text">{deleteProject?.name}</span>? 
            This action cannot be undone and will delete all associated tasks.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDeleteProject(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Project</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
