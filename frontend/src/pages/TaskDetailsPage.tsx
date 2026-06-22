import { useState } from 'react';
import { Share2, MoreHorizontal, AlertCircle, Plus, Paperclip, Clock, Play } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function TaskDetailsPage() {
  const [isLoading] = useState(false);

  if (isLoading) return <div className="p-8">Loading task...</div>;

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      
      {/* Header / Breadcrumbs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center text-sm text-text-muted font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">Projects</span>
          <span className="mx-2 text-border">›</span>
          <span className="hover:text-white cursor-pointer transition-colors">Core Platform v2</span>
          <span className="mx-2 text-border">›</span>
          <span className="text-white font-bold tracking-wider">TF-842</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="border border-border text-text hover:text-white bg-bg hover:bg-surface-2 transition-colors px-3 py-1.5 h-auto text-sm">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button variant="ghost" className="border border-border text-text hover:text-white bg-bg hover:bg-surface-2 transition-colors px-3 py-1.5 h-auto">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Title & Badges */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-4">Implement JWT Security</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-emerald-400/30 text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-400/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> IN PROGRESS
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-red-400/30 text-red-400 text-xs font-bold uppercase tracking-wider bg-red-400/10">
            <AlertCircle className="w-3 h-3" /> HIGH
          </div>
          <div className="px-3 py-1 rounded text-text-muted text-xs font-bold uppercase tracking-wider bg-surface-3">
            BACKEND
          </div>
          <div className="px-3 py-1 rounded text-text-muted text-xs font-bold uppercase tracking-wider bg-surface-3">
            SECURITY
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Description */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-text-muted">📄</span> Description
            </h3>
            <div className="text-sm text-text-muted space-y-4">
              <p>
                We need to migrate our current session-based authentication to a robust JWT (JSON Web Token) implementation to support our upcoming microservices architecture.
              </p>
              <p className="font-bold text-white">Requirements:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Implement Access Tokens (short-lived, 15m) and Refresh Tokens (long-lived, 7d).</li>
                <li>Store Refresh Tokens securely (HttpOnly cookies).</li>
                <li>Create middleware to validate tokens on protected routes.</li>
                <li>Implement a blacklist mechanism for revoked tokens upon logout.</li>
              </ul>
              
              <div className="bg-[#0B1120] border border-border rounded-lg p-4 font-mono text-xs text-[#A5C0F3] leading-relaxed overflow-x-auto mt-4">
<pre><code>{`// Example JWT Payload
{
  "sub": "usr_9a8b7c6d",
  "role": "admin",
  "iat": 1716390000,
  "exp": 1716390900
}`}</code></pre>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-text-muted" /> Attachments
              </h3>
              <button className="text-sm font-semibold text-text-muted hover:text-white flex items-center gap-1 transition-colors">
                <Plus className="w-4 h-4" /> Add File
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-[#0B1120] hover:border-text-muted transition-colors cursor-pointer w-max pr-8">
              <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                PDF
              </div>
              <div>
                <p className="text-sm font-bold text-white">Security_Audit_v2.pdf</p>
                <p className="text-xs text-text-muted mt-0.5">2.4 MB • Uploaded Yesterday</p>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <span className="text-text-muted">💬</span> Activity
            </h3>
            
            <div className="space-y-6">
              {/* Comment Input */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center shrink-0 border border-border overflow-hidden">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <div className="flex-1 bg-[#0B1120] border border-border rounded-lg p-3">
                  <textarea 
                    className="w-full bg-transparent text-sm text-white placeholder-text-muted focus:outline-none resize-none" 
                    placeholder="Add a comment..."
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button className="px-2 py-1 text-xs font-bold text-text-muted hover:text-white">B</button>
                    <button className="px-2 py-1 text-xs font-bold text-text-muted hover:text-white">{'<>'}</button>
                    <Button className="bg-[#A5C0F3] text-black hover:bg-[#93C5FD] font-semibold text-xs py-1.5 px-4 h-auto ml-2">Comment</Button>
                  </div>
                </div>
              </div>

              {/* Comment 1 */}
              <div className="flex gap-4 pt-2">
                <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center shrink-0 border border-border overflow-hidden">
                  <span className="text-xs font-bold text-white">S</span>
                </div>
                <div className="flex-1 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-white">Sarah Jenkins</span>
                    <span className="text-xs text-text-muted">2 hours ago</span>
                  </div>
                  <p className="text-sm text-text-muted">
                    I've started reviewing the auth middleware logic. We need to ensure the token blacklist is performant enough for high-volume requests. Considering Redis for this.
                  </p>
                </div>
              </div>

              {/* Status Change */}
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center shrink-0">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-text-muted" />
                </div>
                <p className="text-sm text-text-muted">
                  <span className="font-bold text-white">Marcus Chen</span> changed status from <span className="text-text-muted">To Do</span> to <span className="text-emerald-400">In Progress</span>
                  <span className="text-xs ml-2">Yesterday at 4:30 PM</span>
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Details */}
          <div className="glass-panel">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-white">Details</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-2">👤 Assignee</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-bold">M</div>
                  Marcus Chen
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-2">👥 Reporter</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-bold">E</div>
                  Elena Rodriguez
                </span>
              </div>
              <div className="w-full h-px bg-border/50" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-2">📅 Due Date</span>
                <span className="text-white font-medium">Oct 24, 2024</span>
              </div>
              <div className="w-full h-px bg-border/50" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-2">📁 Project</span>
                <span className="text-[#A5C0F3] hover:underline cursor-pointer font-medium">Core Platform v2</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-2">🏁 Milestone</span>
                <span className="text-white font-medium">v2.1 Security Update</span>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="glass-panel">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-text-muted" /> Time Tracking</h3>
              <Play className="w-4 h-4 text-text-muted cursor-pointer hover:text-white transition-colors" />
            </div>
            <div className="p-5">
              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-[#A5C0F3] rounded-full" style={{ width: '45%' }} />
              </div>
              <div className="flex justify-between items-center text-xs text-text-muted font-medium">
                <span>4h 30m logged</span>
                <span>10h estimated</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
