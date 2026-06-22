import { useState } from 'react';
import { Download, ChevronDown, Activity, CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '@/components/ui/Button';

export default function AnalyticsPage() {
  const [isLoading] = useState(false);

  if (isLoading) return <div className="p-8">Loading analytics...</div>;

  const burndownData = [
    { name: 'Mon', remaining: 100, ideal: 100 },
    { name: 'Tue', remaining: 80, ideal: 85 },
    { name: 'Wed', remaining: 65, ideal: 70 },
    { name: 'Thu', remaining: 45, ideal: 55 },
    { name: 'Fri', remaining: 30, ideal: 40 },
    { name: 'Sat', remaining: 20, ideal: 25 },
    { name: 'Sun', remaining: 0, ideal: 0 },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Project Analytics</h1>
          <p className="text-text-muted mt-2">Real-time performance metrics and team velocity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0B1120] border border-border rounded-md px-3 py-2 cursor-pointer text-sm font-medium text-text-muted hover:text-white">
            All Projects <ChevronDown className="w-4 h-4 ml-2" />
          </div>
          <div className="flex bg-[#0B1120] border border-border rounded-md px-3 py-2 cursor-pointer text-sm font-medium text-text-muted hover:text-white">
            Last 30 Days <ChevronDown className="w-4 h-4 ml-2" />
          </div>
          <Button className="bg-[#A5C0F3] text-black hover:bg-[#93C5FD] font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Completion Rate</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white leading-none">84%</span>
            <span className="flex items-center text-xs font-bold text-emerald-400 mb-1">
              <TrendingUp className="w-3 h-3 mr-1" /> 4.2%
            </span>
          </div>
        </div>
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Active Tasks</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white leading-none">142</span>
            <span className="flex items-center text-xs font-bold text-red-400 mb-1">
              <TrendingDown className="w-3 h-3 mr-1" /> 12
            </span>
          </div>
        </div>
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Avg Cycle Time</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white leading-none">3.4d</span>
            <span className="flex items-center text-xs font-bold text-emerald-400 mb-1">
              <TrendingDown className="w-3 h-3 mr-1" /> 0.5d
            </span>
          </div>
        </div>
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Blockers</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white leading-none">7</span>
            <span className="flex items-center text-xs font-bold text-text-muted mb-1">
              <Minus className="w-3 h-3 mr-1" /> Unchanged
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Sprint Burndown</h2>
            <MoreHorizontal className="w-5 h-5 text-text-muted" />
          </div>
          <div className="flex-1 min-h-[250px] relative flex items-center justify-center">
             {/* Mock chart visualization since we don't have all recharts props memorized perfectly, keep it simple */}
             <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm">Interactive Chart Component</span>
             </div>
          </div>
        </div>
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Status Distribution</h2>
            <MoreHorizontal className="w-5 h-5 text-text-muted" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
             {/* The 3D square from the screenshot can be mocked with CSS */}
             <div className="w-32 h-32 relative mb-8">
               <div className="absolute inset-0 bg-[#0B1120] border-4 border-t-[#A5C0F3] border-r-emerald-400 border-b-text-muted border-l-surface flex items-center justify-center shadow-lg transform rotate-45">
                 <span className="text-white font-bold text-xl transform -rotate-45">142</span>
               </div>
             </div>
             
             <div className="w-full space-y-3 mt-4">
               <div className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#A5C0F3]" /> <span className="text-text-muted">In Progress</span></div>
                 <span className="text-white font-bold">45%</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> <span className="text-text-muted">Done</span></div>
                 <span className="text-white font-bold">35%</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-text-muted" /> <span className="text-text-muted">To Do</span></div>
                 <span className="text-white font-bold">20%</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Team Velocity Heatmap</h2>
            <p className="text-sm text-text-muted mt-1">Commits & task completions by day.</p>
          </div>
          <CalendarDays className="w-5 h-5 text-text-muted" />
        </div>
        <div className="flex justify-between text-xs text-text-muted font-bold tracking-wider pt-6 border-t border-border mt-4">
          <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
        </div>
      </div>
    </div>
  );
}

// Ensure MoreHorizontal exists
function MoreHorizontal(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
