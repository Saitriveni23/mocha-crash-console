import { Check, Clock, Download, Plus, RotateCcw, Search, SkipForward, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardTitle, CategoryBadge, PageHeader, StepIcon } from '../components/ui';
import { CATEGORY_DOTS, formatElapsed } from '../lib';
import { useDashboard } from '../store';
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
          <h3 className="text-[15px] font-bold text-white">Response Stages</h3>
          <p className="text-xs text-slate-400">
            {done} of {steps.length} complete · incident open for{' '}
            <span className="font-mono-numbers text-rose-300 font-bold">
              {h}:{m}:{s}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetSteps} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 border border-white/15 hover:bg-white/5">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-linear-to-r from-purple-600 to-pink-600 glow-purple hover:brightness-110"
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
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : st.status === 'In progress'
                  ? 'border-blue-500/50 bg-blue-500/10 glow-cyan'
                  : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2">
              <StepIcon step={st} />
              <span className="text-[11px] font-bold text-slate-400">STAGE {st.step}</span>
            </div>
            <div className="text-sm font-bold text-white mt-2">{st.title}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{st.desc}</div>
            <div
              className={`text-[11px] font-bold mt-2 ${st.status === 'Completed' ? 'text-emerald-300' : st.status === 'In progress' ? 'text-blue-300' : 'text-slate-500'}`}
            >
              {st.status}
            </div>
          </div>
        ))}
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
          <button onClick={exportLog} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white hover:bg-white/10">
            <Download className="w-4 h-4" /> Export
          </button>
        }
      />
      <Stages />

      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-[1fr_320px] gap-4">
        <Card className="p-5">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search entries, authors, notes…"
                className="w-full bg-[#0c0f1e]/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-[#0c0f1e]/80 border border-white/10">
              {(['all', 'done', 'pending'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${statusFilter === s ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
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
                  cats.includes(c) ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${CATEGORY_DOTS[c]}`} /> {c}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/10" />
            {visible.map(l => (
              <div key={l.id} className="relative flex gap-4 pb-4 group">
                <span className={`w-[15px] h-[15px] mt-1 rounded-full shrink-0 z-10 border-2 border-[#11162d] ${CATEGORY_DOTS[l.category]}`} />
                <div className="flex-1 min-w-0 rounded-xl bg-white/[0.03] border border-white/5 p-3 hover:border-white/15 transition-colors">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono-numbers">{l.time}</span>
                    <span className="text-sm font-semibold text-white flex-1 min-w-[160px]">{l.text}</span>
                    <CategoryBadge category={l.category} />
                    <button
                      onClick={() => toggleLog(l.id)}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        l.status === 'done' ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' : 'text-slate-300 border-white/15'
                      }`}
                      title="Toggle status"
                    >
                      {l.status === 'done' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {l.status === 'done' ? 'Done' : 'Pending'}
                    </button>
                    <button onClick={() => removeLog(l.id)} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete entry">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {l.author && <div className="text-[11px] text-slate-400 mt-1">by {l.author}</div>}
                  {l.notes && <div className="text-xs text-slate-300 mt-2 pl-3 border-l-2 border-purple-500/50">{l.notes}</div>}
                </div>
              </div>
            ))}
            {!visible.length && <div className="text-sm text-slate-400 text-center py-8">No entries match these filters.</div>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <CardTitle icon={<Plus className="w-4 h-4" />} iconClass="bg-purple-500/20 text-purple-300" title="Add Entry" />
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What happened?"
              className="w-full bg-[#0c0f1e]/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
            />
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={3}
              className="w-full mt-2 bg-[#0c0f1e]/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${category === c ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-slate-400'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="w-full mt-4 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 text-white text-sm font-bold glow-purple disabled:opacity-40 disabled:shadow-none"
            >
              Add to log
            </button>
          </Card>

          <Card className="p-5">
            <h3 className="text-[15px] font-bold text-white mb-2">Entries by Category</h3>
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
                <span className="text-2xl font-extrabold text-white">{logs.length}</span>
                <span className="text-[11px] text-slate-400">entries</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {byCategory.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[d.name] }} />
                  {d.name} <span className="ml-auto font-bold text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-2.5 text-sm">
            <h3 className="text-[15px] font-bold text-white mb-1">Incident Details</h3>
            {[
              ['Incident', 'INC-2025-0425-01'],
              ['Severity', 'SEV-1'],
              ['Commander', 'You (Team Lead)'],
              ['Detected', '10:34:26 AM'],
              ['Trigger', 'Liquidation velocity > 5,000/min'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-slate-400">{k}</span>
                <span className={`font-semibold text-right ${v === 'SEV-1' ? 'text-rose-300' : 'text-white'}`}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
