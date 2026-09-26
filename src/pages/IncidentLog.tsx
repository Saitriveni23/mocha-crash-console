import { Check, Clock, Download, Plus, RotateCcw, Search, SkipForward, Trash2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../components/ui';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardTitle, CategoryBadge, PageHeader, StepIcon } from '../components/ui';
import { CATEGORY_DOTS, formatElapsed } from '../lib';
import { useDashboard } from '../store';
import { TEAM_MEMBERS } from '../mockData';
import type { LogCategory } from '../types';

const CATEGORIES: LogCategory[] = ['Market', 'Support', 'Comms', 'Ops', 'Pending'];
const CATEGORY_COLORS: Record<LogCategory, string> = {
  Market: '#f43f5e',
  Support: '#fbbf24',
  Comms: '#3b82f6',
  Ops: '#a855f7',
  Pending: '#94a3b8',
};

function Stages() {
  const { steps, advanceStep, resetSteps, elapsed, addLog, notify } = useDashboard();
  const [h, m, s] = formatElapsed(elapsed);
  const done = steps.filter(x => x.status === 'Completed').length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-[15px] font-bold text-[#F6EBDD]">Response Stages</h3>
          <p className="text-xs text-[#A49A92]">
            {done} of {steps.length} complete · incident open for{' '}
            <span className="font-mono-numbers text-rose-300 font-bold">
              {h}:{m}:{s}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetSteps} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#A49A92] border border-[#2A211D] hover:bg-[#1F1916]">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={() => {
              const current = steps.find(x => x.status === 'In progress');
              if (!current) return;
              advanceStep();
              addLog(`Completed stage: ${current.title}`, 'Ops');
              notify(`${current.title} marked complete`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#F6EBDD] bg-linear-to-r from-[#B66A3C] to-[#D9A35E] glow-gold hover:brightness-110"
          >
            <SkipForward className="w-3.5 h-3.5" /> Complete current stage
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map(st => (
          <div
            key={st.step}
            className={`p-3.5 rounded-xl border ${
              st.status === 'Completed'
                ? 'border-[#48D597]/30 bg-[#48D597]/10'
                : st.status === 'In progress'
                  ? 'border-[#A49A92]/30 bg-[#A49A92]/10 glow-gold'
                  : 'border-[#2A211D] bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2">
              <StepIcon step={st} />
              <span className="text-[11px] font-bold text-[#A49A92]">STAGE {st.step}</span>
            </div>
            <div className="text-sm font-bold text-[#F6EBDD] mt-2">{st.title}</div>
            <div className="text-[11px] text-[#A49A92] mt-0.5 leading-snug">{st.desc}</div>
            <div
              className={`text-[11px] font-bold mt-2 ${st.status === 'Completed' ? 'text-[#48D597]' : st.status === 'In progress' ? 'text-[#A49A92]' : 'text-[#A49A92]/70'}`}
            >
              {st.status}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamTimeline() {
  const { simulationElapsed } = useDashboard();
  const mins = Math.floor(simulationElapsed / 60);
  const isResolved = mins >= 60;

  const PHASES = [
    { start: 0, end: 20, label: '0-20m' },
    { start: 20, end: 40, label: '20-40m' },
    { start: 40, end: 60, label: '40-60m' },
  ];

  const MEMBER_TASKS = [
    { id: 'm1', tasks: ['Coordinate Response', 'Approve Margins', 'Final Review'] }, // You
    { id: 'm2', tasks: ['Monitor Liquidations', 'Execute Blocks', 'Oracle Health'] }, // Arjun
    { id: 'm3', tasks: ['Issue Comms', 'Support Surge', 'All Clear Notice'] }, // Meera
  ];

  if (isResolved) {
    return (
      <Card className="p-8 border-[#48D597]/40 bg-[#48D597]/10 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-16 h-16 text-[#48D597] mb-3 drop-shadow-[0_0_12px_rgba(72,213,151,0.5)]" />
        <h2 className="text-3xl font-bold text-[#F6EBDD] tracking-tight">CRASH RESOLVED</h2>
        <p className="text-[#A49A92] mt-2 max-w-md">The 60-minute flash crash simulation has successfully concluded. All systems and limits are fully restored.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-bold text-[#F6EBDD] mb-4">60-Minute Resolution Timeline</h3>
      
      {/* Timeline Header (Time brackets) */}
      <div className="flex ml-[120px] mb-2 border-b border-[#2A211D] pb-2">
        {PHASES.map((p, i) => {
          const active = mins >= p.start && mins < p.end;
          return (
            <div key={i} className={`flex-1 text-center text-[10px] font-bold ${active ? 'text-[#D9A35E]' : 'text-[#A49A92]'}`}>
              {p.label}
            </div>
          );
        })}
      </div>

      {/* Team Rows */}
      <div className="space-y-3">
        {MEMBER_TASKS.map(mt => {
          const member = TEAM_MEMBERS.find(m => m.id === mt.id)!;
          return (
            <div key={mt.id} className="flex items-center">
              {/* Avatar Column */}
              <div className="w-[120px] shrink-0 flex items-center gap-2 pr-4 border-r border-[#2A211D]">
                <Avatar member={member} size={28} />
                <div className="text-[11px] font-bold text-[#F6EBDD] truncate">{member.shortName}</div>
              </div>
              
              {/* Tasks Row */}
              <div className="flex-1 flex gap-2 pl-2">
                {mt.tasks.map((task, i) => {
                  const phaseStart = i * 20;
                  const phaseEnd = phaseStart + 20;
                  const isDone = mins >= phaseEnd;
                  const isActive = mins >= phaseStart && mins < phaseEnd;
                  
                  let bg = 'bg-[#1F1916] border-[#2A211D] text-[#A49A92]';
                  if (isDone) bg = 'bg-[#48D597]/15 border-[#48D597]/30 text-[#48D597]';
                  else if (isActive) bg = 'bg-gradient-to-r from-[#D9A35E]/15 to-[#B66A3C]/15 border-[#D9A35E]/40 text-[#D9A35E] glow-gold';

                  return (
                    <div key={i} className={`flex-1 rounded-lg border p-2 flex flex-col justify-center items-center text-center transition-colors ${bg}`}>
                      <span className="text-[10px] font-bold leading-tight">{task}</span>
                      <span className="text-[9px] mt-0.5 opacity-60 uppercase tracking-wide">
                        {isDone ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar overlay */}
      <div className="mt-5 relative h-1.5 bg-[#1F1916] rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D9A35E] to-[#B66A3C] transition-all" style={{ width: `${(mins / 60) * 100}%` }} />
      </div>
    </Card>
  );
}

export default function IncidentLog() {
  const { logs, addLog, toggleLog, removeLog, notify } = useDashboard();
  const [query, setQuery] = useState('');
  const [cats, setCats] = useState<LogCategory[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'pending'>('all');
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<LogCategory>('Ops');

  const visible = logs.filter(
    l =>
      (!cats.length || cats.includes(l.category)) &&
      (statusFilter === 'all' || l.status === statusFilter) &&
      (l.text + ' ' + (l.author ?? '') + ' ' + (l.notes ?? '')).toLowerCase().includes(query.toLowerCase()),
  );

  const byCategory = CATEGORIES.map(c => ({ name: c, value: logs.filter(l => l.category === c).length })).filter(x => x.value);

  const submit = () => {
    if (!text.trim()) return;
    addLog(text.trim(), category, 'You (Team Lead)', 'pending', notes.trim() || undefined);
    setText('');
    setNotes('');
    notify('Log entry added');
  };

  const exportLog = () => {
    const md = [
      '# MochaTrade Flash Crash — Incident Log',
      '',
      ...logs.map(l => `- **${l.time}** [${l.category}] ${l.text} — ${l.author ?? 'unknown'} (${l.status})${l.notes ? `\n  - ${l.notes}` : ''}`),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'incident-log.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking synchronously can cancel the download before the browser reads the blob
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Incident log exported', 'info');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Incident Log"
        subtitle="Every decision and observation, timestamped for the post-incident review"
        right={
          <button onClick={exportLog} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2A211D] bg-[#1F1916] text-sm font-semibold text-[#F6EBDD] hover:bg-[#2A211D]">
            <Download className="w-4 h-4" /> Export
          </button>
        }
      />
      <TeamTimeline />
      <Stages />

      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-[1fr_320px] gap-4">
        <Card className="p-5">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#A49A92]/70 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search entries, authors, notes…"
                className="w-full bg-[#090807]/80 border border-[#2A211D] rounded-xl pl-9 pr-3 py-2 text-sm text-[#F6EBDD] placeholder:text-[#A49A92]/70 focus:outline-none focus:border-[#D9A35E]"
              />
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-[#090807]/80 border border-[#2A211D]">
              {(['all', 'done', 'pending'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${statusFilter === s ? 'bg-purple-600 text-[#F6EBDD]' : 'text-[#A49A92] hover:text-[#F6EBDD]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCats(cs => (cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]))}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                  cats.includes(c) ? 'bg-[#2A211D] border-white/30 text-[#F6EBDD]' : 'border-[#2A211D] text-[#A49A92] hover:text-[#F6EBDD]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${CATEGORY_DOTS[c]}`} /> {c}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[#2A211D]" />
            {visible.map(l => (
              <div key={l.id} className="relative flex gap-4 pb-4 group">
                <span className={`w-[15px] h-[15px] mt-1 rounded-full shrink-0 z-10 border-2 border-[#11162d] ${CATEGORY_DOTS[l.category]}`} />
                <div className="flex-1 min-w-0 rounded-xl bg-[#090807] border border-[#2A211D] p-3 hover:border-[#2A211D] transition-colors">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#A49A92] font-mono-numbers">{l.time}</span>
                    <span className="text-sm font-semibold text-[#F6EBDD] flex-1 min-w-[160px]">{l.text}</span>
                    <CategoryBadge category={l.category} />
                    <button
                      onClick={() => toggleLog(l.id)}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        l.status === 'done' ? 'text-[#48D597] border-[#48D597]/30 bg-[#48D597]/10' : 'text-[#A49A92] border-[#2A211D]'
                      }`}
                      title="Toggle status"
                    >
                      {l.status === 'done' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {l.status === 'done' ? 'Done' : 'Pending'}
                    </button>
                    <button onClick={() => removeLog(l.id)} className="text-[#A49A92]/70 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete entry">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {l.author && <div className="text-[11px] text-[#A49A92] mt-1">by {l.author}</div>}
                  {l.notes && <div className="text-xs text-[#A49A92] mt-2 pl-3 border-l-2 border-[#D9A35E]/30">{l.notes}</div>}
                </div>
              </div>
            ))}
            {!visible.length && <div className="text-sm text-[#A49A92] text-center py-8">No entries match these filters.</div>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <CardTitle icon={<Plus className="w-4 h-4" />} iconClass="bg-[#D9A35E]/10 text-[#D9A35E]" title="Add Entry" />
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What happened?"
              className="w-full bg-[#090807]/80 border border-[#2A211D] rounded-xl px-3 py-2 text-sm text-[#F6EBDD] placeholder:text-[#A49A92]/70 focus:outline-none focus:border-[#D9A35E]"
            />
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={3}
              className="w-full mt-2 bg-[#090807]/80 border border-[#2A211D] rounded-xl px-3 py-2 text-sm text-[#F6EBDD] placeholder:text-[#A49A92]/70 focus:outline-none focus:border-[#D9A35E] resize-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${category === c ? 'bg-[#2A211D] border-white/30 text-[#F6EBDD]' : 'border-[#2A211D] text-[#A49A92]'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="w-full mt-4 py-2.5 rounded-xl bg-linear-to-r from-[#B66A3C] to-[#D9A35E] text-[#F6EBDD] text-sm font-bold glow-gold disabled:opacity-40 disabled:shadow-none"
            >
              Add to log
            </button>
          </Card>

          <Card className="p-5">
            <h3 className="text-[15px] font-bold text-[#F6EBDD] mb-2">Entries by Category</h3>
            <div className="h-[160px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none" isAnimationActive={false}>
                    {byCategory.map(d => (
                      <Cell key={d.name} fill={CATEGORY_COLORS[d.name]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-[#F6EBDD]">{logs.length}</span>
                <span className="text-[11px] text-[#A49A92]">entries</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {byCategory.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs text-[#A49A92]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[d.name] }} />
                  {d.name} <span className="ml-auto font-bold text-[#F6EBDD]">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-2.5 text-sm">
            <h3 className="text-[15px] font-bold text-[#F6EBDD] mb-1">Incident Details</h3>
            {[
              ['Incident', 'INC-2025-0425-01'],
              ['Severity', 'SEV-1'],
              ['Commander', 'You (Team Lead)'],
              ['Detected', '10:34:26 AM'],
              ['Trigger', 'Liquidation velocity > 5,000/min'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-[#A49A92]">{k}</span>
                <span className={`font-semibold text-right ${v === 'SEV-1' ? 'text-rose-300' : 'text-[#F6EBDD]'}`}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
