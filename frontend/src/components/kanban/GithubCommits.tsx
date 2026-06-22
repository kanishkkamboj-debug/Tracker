import { useState, useEffect } from 'react';
import { GitCommit, ExternalLink, Loader2, GitBranch } from 'lucide-react';

interface Props {
  repoUrl: string;
}

interface CommitData {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    avatar_url: string;
    login: string;
  } | null;
  html_url: string;
}

export default function GithubCommits({ repoUrl }: Props) {
  const [commits, setCommits] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract owner and repo from URL
  // Supported formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  const getOwnerRepo = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== 'github.com') return null;
      const parts = parsedUrl.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        let repo = parts[1];
        if (repo.endsWith('.git')) {
          repo = repo.slice(0, -4);
        }
        return { owner: parts[0], repo };
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const ownerRepo = getOwnerRepo(repoUrl);
    if (!ownerRepo) {
      setError('Invalid GitHub repository URL');
      setLoading(false);
      return;
    }

    const fetchCommits = async () => {
      try {
        setLoading(true);
        // Note: public unauthenticated API limits apply (60 req/hour)
        const res = await fetch(`https://api.github.com/repos/${ownerRepo.owner}/${ownerRepo.repo}/commits?per_page=5`);
        if (!res.ok) {
          throw new Error(res.status === 403 || res.status === 404 ? 'Repository not found or rate limited' : 'Failed to fetch commits');
        }
        const data = await res.json();
        setCommits(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [repoUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-text-muted bg-surface-2 rounded-xl border border-border">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-accent" />
        <span className="text-sm">Fetching latest commits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-400 bg-red-400/10 rounded-xl border border-red-500/20 flex flex-col items-center text-center">
        <GitBranch className="w-8 h-8 mb-2 opacity-50" />
        <p className="font-semibold text-red-300">Could not load repository</p>
        <p className="mt-1 opacity-80">{error}</p>
        <a href={repoUrl} target="_blank" rel="noreferrer" className="mt-3 text-red-300 hover:underline flex items-center gap-1 text-xs">
          Open Repository directly <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="p-6 text-sm text-text-muted bg-surface-2 rounded-xl border border-border text-center">
        No commits found.
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2 text-white font-medium">
          <GitBranch className="w-4 h-4 text-accent" />
          Recent Commits
        </div>
        <a 
          href={repoUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-text-muted hover:text-white flex items-center gap-1 transition-colors"
        >
          View on GitHub <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="divide-y divide-border/50">
        {commits.map((commitData) => {
          const messageFirstLine = commitData.commit.message.split('\n')[0];
          const date = new Date(commitData.commit.author.date).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
          });
          
          return (
            <div key={commitData.sha} className="p-4 hover:bg-surface-2 transition-colors group">
              <div className="flex items-start gap-3">
                {commitData.author?.avatar_url ? (
                  <img src={commitData.author.avatar_url} alt="avatar" className="w-8 h-8 rounded-full border border-border shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-text-muted font-bold text-xs shrink-0">
                    {commitData.commit.author.name[0]?.toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <a 
                      href={commitData.html_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-sm font-semibold text-white hover:text-accent truncate transition-colors"
                      title={commitData.commit.message}
                    >
                      {messageFirstLine}
                    </a>
                    <a 
                      href={commitData.html_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-mono text-text-muted hover:text-white shrink-0"
                    >
                      {commitData.sha.substring(0, 7)}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="font-medium text-text">{commitData.commit.author.name}</span>
                    <span>•</span>
                    <span>{date}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
