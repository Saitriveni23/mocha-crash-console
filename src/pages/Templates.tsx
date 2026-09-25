import { Copy, FileText, Plus, Search, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Card, PageHeader, Pill } from '../components/ui';
import { TEMPLATE_CATEGORY_STYLE } from '../lib';
import { useDashboard } from '../store';
import type { TemplateCategory } from '../types';

const CATEGORIES: TemplateCategory[] = ['Critical', 'Support', 'Recovery', 'Advisory'];
const CHANNELS = ['Twitter/X', 'In-App Banner', 'Email', 'Telegram', 'Status Page', 'Help Center'];

function NewTemplate({ onClose }: { onClose: () => void }) {
  const { setTemplates, notify } = useDashboard();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('Advisory');
  const [channels, setChannels] = useState<string[]>(['Twitter/X', 'In-App Banner']);

  const save = () => {
    setTemplates(t => [...t, { id: `t-${Date.now()}`, title: title.trim(), content: content.trim(), category, channels }]);
    notify('Template saved');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card className="p-6 animate-fade-up" glow="purple">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white">New Template</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full mt-1.5 mb-4 bg-[#0c0f1e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
          />
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2 mt-1.5 mb-4">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs font-bold px-3 py-1 rounded-full border ${category === c ? TEMPLATE_CATEGORY_STYLE[c] : 'border-white/10 text-slate-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Message</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            className="w-full mt-1.5 mb-4 bg-[#0c0f1e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400 resize-none"
          />
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Default channels</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {CHANNELS.map(c => (
              <button
                key={c}
                onClick={() => setChannels(cs => (cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]))}
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${channels.includes(c) ? 'bg-pink-500/20 border-pink-400/60 text-white' : 'border-white/10 text-slate-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 border border-white/15 hover:bg-white/5">
              Cancel
            </button>
            <button
              disabled={!title.trim() || !content.trim()}
              onClick={save}
              className="px-5 py-2 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 text-white text-sm font-bold glow-purple disabled:opacity-40 disabled:shadow-none"
            >
              Save template
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Templates() {
  const { templates, setTemplates, setSelectedTemplateId, setTab, notify } = useDashboard();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<TemplateCategory | 'All'>('All');
  const [creating, setCreating] = useState(false);

  const visible = templates.filter(
    t => (category === 'All' || t.category === category) && (t.title + t.content).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Templates"
        subtitle="Pre-approved customer messages, ready to send in seconds"
        right={
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 text-white text-sm font-bold glow-purple hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> New template
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="w-full cyber-card rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', ...CATEGORIES] as const).map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors ${
                category === c ? 'bg-purple-500/25 border-purple-400/60 text-white' : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 *:min-w-0 md:grid-cols-2 2xl:grid-cols-3 gap-4">
        {visible.map(t => (
          <Card key={t.id} className="p-5 flex flex-col hover:border-purple-400/50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-purple-300" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TEMPLATE_CATEGORY_STYLE[t.category]}`}>{t.category}</span>
            </div>
            <h3 className="text-[15px] font-bold text-white mt-3 leading-snug">{t.title}</h3>
            <p className="text-[13px] text-slate-400 mt-2 leading-relaxed line-clamp-4 flex-1">{t.content}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {t.channels.map(c => (
                <Pill key={c} className="border-white/10 text-slate-300">
                  {c}
                </Pill>
              ))}
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  setSelectedTemplateId(t.id);
                  setTab('Communications');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-linear-to-r from-pink-500 to-fuchsia-600 text-white text-xs font-bold hover:brightness-110"
              >
                <Send className="w-3.5 h-3.5" /> Use template
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(t.content).then(
                    () => notify('Copied to clipboard', 'info'),
                    () => notify('Clipboard unavailable', 'danger'),
                  );
                }}
                className="px-3 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5"
                aria-label="Copy template text"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setTemplates(ts => ts.filter(x => x.id !== t.id));
                  notify('Template deleted', 'danger');
                }}
                disabled={templates.length <= 1}
                className="px-3 rounded-lg border border-white/15 text-slate-300 hover:text-rose-400 hover:bg-white/5 disabled:opacity-30"
                aria-label="Delete template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        <button
          onClick={() => setCreating(true)}
          className="rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-400/50 min-h-[260px] flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <Plus className="w-8 h-8" />
          <span className="text-sm font-semibold">Create a new template</span>
        </button>
      </div>

      {creating && <NewTemplate onClose={() => setCreating(false)} />}
    </div>
  );
}
