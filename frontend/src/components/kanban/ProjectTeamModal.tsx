import { useState, useEffect } from 'react';
import { projectsApi } from '@/api/projects';
import { membersApi, type MemberItem } from '@/api/notifications'; // using the membersApi
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { Search, UserPlus, X, Shield, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export default function ProjectTeamModal({ isOpen, onClose, projectId }: Props) {
  const { toast } = useToast();
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [membersRes, usersRes] = await Promise.all([
        projectsApi.getMembers(projectId),
        membersApi.getAll(),
      ]);
      setProjectMembers(membersRes.data.data || []);
      setAllUsers(usersRes.data.data || []);
    } catch (error) {
      toast('Failed to load team data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, projectId]);

  const handleAddMember = async (userId: number) => {
    try {
      await projectsApi.addMember(projectId, userId);
      toast('Member added successfully', 'success');
      loadData();
    } catch (error) {
      toast('Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await projectsApi.removeMember(projectId, userId);
      toast('Member removed', 'success');
      loadData();
    } catch (error) {
      toast('Failed to remove member', 'error');
    }
  };

  const projectMemberIds = new Set(projectMembers.map(m => m.id));

  const filteredUsers = allUsers.filter(u => 
    !projectMemberIds.has(u.id) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || 
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Project Team" size="lg">
      <div className="space-y-6">
        
        {/* Current Team */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Current Members ({projectMembers.length})</h3>
          {isLoading ? (
            <div className="text-sm text-text-muted">Loading members...</div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {projectMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        {member.name}
                        {member.role === 'OWNER' && <Shield className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <div className="text-xs text-text-muted">{member.email}</div>
                    </div>
                  </div>
                  {member.role !== 'OWNER' && (
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      title="Remove from project"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Members */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-white mb-3">Add to Project</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-md text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {filteredUsers.length === 0 ? (
              <div className="text-sm text-text-muted text-center py-4">
                {search ? 'No users found matching search' : 'All workspace users are already in this project'}
              </div>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-text-muted font-bold text-xs">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-xs text-text-muted">{user.email}</div>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 gap-1"
                    onClick={() => handleAddMember(user.id)}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
