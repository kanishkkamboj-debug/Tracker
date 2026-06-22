import { useState, useEffect } from 'react';
import { Github, Twitter, Linkedin, Globe, Mail, MapPin, Users, CheckCircle2, Folder } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';

interface MemberStats {
  name: string;
  email: string;
  id: number;
  taskCount: number;
  projectCount: number;
  completedCount: number;
}

// Gradient backgrounds for cards
const CARD_GRADIENTS = [
  'from-violet-600/20 to-purple-900/30',
  'from-blue-600/20 to-cyan-900/30',
  'from-emerald-600/20 to-teal-900/30',
  'from-rose-600/20 to-pink-900/30',
  'from-amber-600/20 to-orange-900/30',
  'from-indigo-600/20 to-blue-900/30',
];

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
];

// Social links are illustrative — in a real app you'd store them per user
const SOCIAL_LINKS = [
  { Icon: Linkedin, label: 'LinkedIn',  href: '#' },
  { Icon: Github,   label: 'GitHub',    href: '#' },
  { Icon: Twitter,  label: 'Twitter',   href: '#' },
];

export default function MembersPage() {
  const { toast } = useToast();
  const currentUser = useAuthStore((s) => s.user);
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        // Derive members from projects + tasks: collect unique assigneeNames
        const projRes = await projectsApi.list(0, 100);
        const allProjects = projRes.data.data.content;

        const taskArrays = await Promise.all(
          allProjects.map((p) => projectsApi.getTasks(p.id).then((r) => r.data.data.map((t) => ({ ...t, projectId: p.id, projectName: p.name }))))
        );
        const allTasks = taskArrays.flat();

        // Build member map from current user + assignees
        const memberMap = new Map<string, MemberStats>();

        // Add the current user
        if (currentUser) {
          memberMap.set(currentUser.name, {
            name: currentUser.name,
            email: currentUser.email,
            id: currentUser.id,
            taskCount: 0,
            projectCount: 0,
            completedCount: 0,
          });
        }

        // Add assignees from tasks
        allTasks.forEach((task) => {
          if (!task.assigneeName) return;
          if (!memberMap.has(task.assigneeName)) {
            memberMap.set(task.assigneeName, {
              name: task.assigneeName,
              email: `${task.assigneeName.toLowerCase().replace(/\s+/g, '.')}@team.com`,
              id: Math.abs(task.assigneeName.charCodeAt(0) * 7 + task.assigneeName.length * 13),
              taskCount: 0,
              projectCount: 0,
              completedCount: 0,
            });
          }
          const m = memberMap.get(task.assigneeName)!;
          m.taskCount++;
          if (task.status === 'DONE') m.completedCount++;
        });

        // Count projects per member
        allProjects.forEach((proj) => {
          if (proj.ownerName && memberMap.has(proj.ownerName)) {
            memberMap.get(proj.ownerName)!.projectCount++;
          }
        });

        setMembers(Array.from(memberMap.values()));
      } catch {
        toast('Failed to load members', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast, currentUser]);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Members</h1>
          <p className="text-text-muted mt-1">Your team — {members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-md text-white text-sm placeholder-text-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-text-muted">
          <Users className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No members found</p>
          <p className="text-sm opacity-60 mt-1">Assign tasks to teammates to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((member, idx) => {
            const gradient  = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
            const avatarBg  = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const initials  = member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
            const isMe      = member.name === currentUser?.name;
            const completion = member.taskCount > 0 ? Math.round((member.completedCount / member.taskCount) * 100) : 0;

            return (
              <div
                key={member.id}
                className="relative group overflow-hidden bg-surface border border-border rounded-2xl hover:border-text-muted/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Banner gradient */}
                <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
                  {isMe && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="px-5 pb-5">
                  <div className={`-mt-8 w-16 h-16 rounded-2xl ${avatarBg} flex items-center justify-center text-2xl font-bold text-white border-4 border-surface shadow-lg`}>
                    {initials}
                  </div>

                  {/* Name & role */}
                  <div className="mt-3">
                    <h3 className="text-white font-bold text-base leading-tight">{member.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Mail className="w-3 h-3 text-text-muted" />
                      <p className="text-text-muted text-xs truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-surface-2 rounded-lg py-2 px-1">
                      <p className="text-white font-bold text-lg leading-none">{member.taskCount}</p>
                      <p className="text-text-muted text-[10px] mt-0.5 uppercase tracking-wide">Tasks</p>
                    </div>
                    <div className="bg-surface-2 rounded-lg py-2 px-1">
                      <p className="text-white font-bold text-lg leading-none">{member.projectCount}</p>
                      <p className="text-text-muted text-[10px] mt-0.5 uppercase tracking-wide">Projects</p>
                    </div>
                    <div className="bg-surface-2 rounded-lg py-2 px-1">
                      <p className="text-emerald-400 font-bold text-lg leading-none">{completion}%</p>
                      <p className="text-text-muted text-[10px] mt-0.5 uppercase tracking-wide">Done</p>
                    </div>
                  </div>

                  {/* Completion bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                      <span>Task completion</span>
                      <span>{member.completedCount}/{member.taskCount}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="mt-4 flex items-center gap-2">
                    {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 border border-border text-text-muted hover:text-white hover:border-text-muted/40 hover:bg-surface-3 transition-colors"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    ))}
                    <a
                      href={`mailto:${member.email}`}
                      aria-label="Email"
                      className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
