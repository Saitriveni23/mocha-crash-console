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
        <Card className="p-6 animate-fade-up border-[#D9A35E]/25">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#F6EBDD]">New Template</h3>
            <button onClick={onClose} className="text-[#A49A92] hover:text-[#F6EBDD]" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <label className="text-[11px] font-bold text-[#A49A92] uppercase tracking-wider">Title</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full mt-1.5 mb-4 bg-[#090807] border border-[#2A211D] rounded-xl px-3 py-2 text-sm text-[#F6EBDD] focus:outline-none focus:border-[#D9A35E]"
          />
          <label className="text-[11px] font-bold text-[#A49A92] uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2 mt-1.5 mb-4">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs font-bold px-3 py-1 rounded-full border ${category === c ? TEMPLATE_CATEGORY_STYLE[c] : 'border-[#2A211D] text-[#A49A92]'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="text-[11px] font-bold text-[#A49A92] uppercase tracking-wider">Message</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            className="w-full mt-1.5 mb-4 bg-[#090807] border border-[#2A211D] rounded-xl px-3 py-2 text-sm text-[#F6EBDD] focus:outline-none focus:border-[#D9A35E] resize-none"
          />
          <label className="text-[11px] font-bold text-[#A49A92] uppercase tracking-wider">Default channels</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {CHANNELS.map(c => (
              <button
                key={c}
                onClick={() => setChannels(cs => (cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]))}
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${channels.includes(c) ? 'bg-[#B66A3C]/10 border-[#B66A3C]/30 text-[#F6EBDD]' : 'border-[#2A211D] text-[#A49A92]'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#A49A92] border border-[#2A211D] hover:bg-[#1F1916]">
              Cancel
            </button>
            <button
              disabled={!title.trim() || !content.trim()}
              onClick={save}
              className="px-5 py-2 rounded-xl bg-linear-to-r from-[#B66A3C] to-[#D9A35E] text-[#F6EBDD] text-sm font-bold glow-gold disabled:opacity-40 disabled:shadow-none"
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#B66A3C] to-[#D9A35E] text-[#F6EBDD] text-sm font-bold glow-gold hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> New template
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-[#A49A92]/70 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="w-full mt-card rounded-xl pl-9 pr-3 py-2 text-sm text-[#F6EBDD] placeholder:text-[#A49A92]/70 focus:outline-none focus:border-[#D9A35E]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', ...CATEGORIES] as const).map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors ${
                category === c ? 'bg-[#D9A35E]/10 border-[#D9A35E]/30 text-[#F6EBDD]' : 'border-[#2A211D] text-[#A49A92] hover:text-[#F6EBDD]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 *:min-w-0 md:grid-cols-2 2xl:grid-cols-3 gap-4">
        {visible.map(t => (
          <Card key={t.id} className="p-5 flex flex-col hover:border-[#D9A35E]/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9A35E]/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#D9A35E]" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TEMPLATE_CATEGORY_STYLE[t.category]}`}>{t.category}</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#F6EBDD] mt-3 leading-snug">{t.title}</h3>
            <p className="text-[13px] text-[#A49A92] mt-2 leading-relaxed line-clamp-4 flex-1">{t.content}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {t.channels.map(c => (
                <Pill key={c} className="border-[#2A211D] text-[#A49A92]">
                  {c}
                </Pill>
              ))}
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-[#2A211D]">
              <button
                onClick={() => {
                  setSelectedTemplateId(t.id);
                  setTab('Communications');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-linear-to-r from-[#B66A3C] to-fuchsia-600 text-[#F6EBDD] text-xs font-bold hover:brightness-110"
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
                className="px-3 rounded-lg border border-[#2A211D] text-[#A49A92] hover:bg-[#1F1916]"
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
                className="px-3 rounded-lg border border-[#2A211D] text-[#A49A92] hover:text-rose-400 hover:bg-[#1F1916] disabled:opacity-30"
                aria-label="Delete template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        <button
          onClick={() => setCreating(true)}
          className="rounded-2xl border-2 border-dashed border-[#2A211D] hover:border-[#D9A35E]/30 min-h-[260px] flex flex-col items-center justify-center gap-2 text-[#A49A92] hover:text-[#F6EBDD] transition-colors"
        >
          <Plus className="w-8 h-8" />
          <span className="text-sm font-semibold">Create a new template</span>
        </button>
      </div>

      {creating && <NewTemplate onClose={() => setCreating(false)} />}
    </div>
  );
}
