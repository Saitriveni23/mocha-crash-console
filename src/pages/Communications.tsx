import { AtSign, Bell, CheckCircle2, FileText, Globe, Heart, History, Mail, MessageCircle, Repeat2, Send, Smartphone, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Card, CardTitle, PageHeader, Pill } from '../components/ui';
import { TEMPLATE_CATEGORY_STYLE } from '../lib';
import { useDashboard } from '../store';
import type { CommunicationTemplate } from '../types';

const CHANNEL_ICONS: Record<string, ReactNode> = {
  'Twitter/X': <AtSign className="w-3.5 h-3.5" />,
  'In-App Banner': <Smartphone className="w-3.5 h-3.5" />,
  'In-App Notification': <Bell className="w-3.5 h-3.5" />,
  Email: <Mail className="w-3.5 h-3.5" />,
  Telegram: <Send className="w-3.5 h-3.5" />,
  'Status Page': <Globe className="w-3.5 h-3.5" />,
  'Help Center': <FileText className="w-3.5 h-3.5" />,
};

const ALL_CHANNELS = ['Twitter/X', 'In-App Banner', 'Email', 'Telegram', 'Status Page', 'Help Center'];
const AUDIENCES = ['All Users', 'Margin Traders', 'VIP Accounts', 'Internal Only'];

function Composer({ template }: { template: CommunicationTemplate }) {
  const { sendMessage, settings } = useDashboard();
  // Channels switched off in Settings are not offered here
  const available = ALL_CHANNELS.filter(c => settings.channels[c]);
  const [content, setContent] = useState(template.content);
  const [channels, setChannels] = useState<string[]>(template.channels.filter(c => available.includes(c)));
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [preview, setPreview] = useState<'Twitter/X' | 'In-App' | 'Email'>('Twitter/X');
  const [confirming, setConfirming] = useState(false);

  const tooLongForX = channels.includes('Twitter/X') && content.length > 280;

  const toggle = (c: string) => setChannels(cs => (cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]));

  return (
    <div className="grid grid-cols-1 *:min-w-0 2xl:grid-cols-[1.2fr_1fr] gap-4">
      <Card className="p-5 flex flex-col">
        <CardTitle
          icon={<Send className="w-4 h-4" />}
          title="Compose Broadcast"
          subtitle={template.title}
          right={<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TEMPLATE_CATEGORY_STYLE[template.category]}`}>{template.category}</span>}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={7}
          className="w-full bg-[#090807]/80 border border-[#2A211D] rounded-xl p-3.5 text-sm text-[#F6EBDD] leading-relaxed focus:outline-none focus:border-[#D9A35E] resize-none custom-scrollbar"
        />
        <div className="flex justify-between text-[11px] mt-1.5">
          <span className={tooLongForX ? 'text-amber-300 font-semibold' : 'text-[#A49A92]/70'}>
            {tooLongForX ? 'Longer than 280 characters — X will post it as a thread' : 'Pre-approved wording. Edits are logged.'}
          </span>
          <span className="text-[#A49A92]/70 font-mono-numbers">{content.length} chars</span>
        </div>

        <div className="mt-5">
          <div className="text-[11px] font-bold text-[#A49A92] uppercase tracking-wider mb-2">Audience</div>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map(a => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  audience === a ? 'bg-[#D9A35E]/10 border-[#D9A35E]/30 text-[#F6EBDD]' : 'border-[#2A211D] text-[#A49A92] hover:text-[#F6EBDD]'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-bold text-[#A49A92] uppercase tracking-wider mb-2">Channels</div>
          <div className="flex flex-wrap gap-2">
            {available.map(c => (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  channels.includes(c) ? 'bg-[#B66A3C]/10 border-[#B66A3C]/30 text-[#F6EBDD]' : 'border-[#2A211D] text-[#A49A92] hover:text-[#F6EBDD]'
                }`}
              >
                {CHANNEL_ICONS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#2A211D] flex flex-wrap items-center gap-3">
          {confirming ? (
            <>
              <span className="text-sm text-[#F6EBDD] flex-1">
                Send to <b>{audience}</b> via <b>{channels.length}</b> channel{channels.length === 1 ? '' : 's'}?
              </span>
              <button onClick={() => setConfirming(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#A49A92] border border-[#2A211D] hover:bg-[#1F1916]">
                Cancel
              </button>
              <button
                onClick={() => {
                  sendMessage(template.title, channels, audience);
                  setConfirming(false);
                }}
                className="px-5 py-2 rounded-xl bg-linear-to-r from-rose-600 to-[#D9A35E] text-[#F6EBDD] text-sm font-bold glow-gold hover:brightness-110"
              >
                Confirm & send
              </button>
            </>
          ) : (
            <button
              disabled={!channels.length || !content.trim()}
              onClick={() => setConfirming(true)}
              className="ml-auto px-5 py-2.5 rounded-xl bg-linear-to-r from-[#B66A3C] to-fuchsia-600 text-[#F6EBDD] text-sm font-bold glow-gold hover:brightness-110 disabled:opacity-40 disabled:shadow-none flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send broadcast
            </button>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-[#F6EBDD]">Preview</h3>
          <div className="flex gap-1 p-1 rounded-lg bg-[#090807]/80 border border-[#2A211D]">
            {(['Twitter/X', 'In-App', 'Email'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPreview(p)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${preview === p ? 'bg-purple-600 text-[#F6EBDD]' : 'text-[#A49A92] hover:text-[#F6EBDD]'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {preview === 'Twitter/X' && (
          <div className="rounded-xl bg-black border border-[#2A211D] p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#B66A3C] to-[#D9A35E] flex items-center justify-center text-[#F6EBDD] font-extrabold shrink-0">M</div>
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="font-bold text-[#F6EBDD]">MochaTrade</span> <span className="text-[#A49A92]/70">@mochatrade_status · now</span>
                </div>
                <p className="text-sm text-[#F6EBDD] mt-1 whitespace-pre-wrap break-words">{content.slice(0, 280)}{content.length > 280 && '… 🧵'}</p>
                <div className="flex gap-10 mt-3 text-[#A49A92]/70">
                  <MessageCircle className="w-4 h-4" />
                  <Repeat2 className="w-4 h-4" />
                  <Heart className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}
        {preview === 'In-App' && (
          <div className="mx-auto max-w-[280px] rounded-[28px] border-4 border-[#1e2748] bg-[#090807] p-3 pt-6">
            <div className="rounded-xl bg-linear-to-r from-rose-600/90 to-[#D9A35E]/90 p-3 text-[#F6EBDD]">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Bell className="w-3.5 h-3.5" /> {template.title}
              </div>
              <p className="text-[11px] mt-1.5 leading-relaxed opacity-95 line-clamp-6">{content}</p>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-16 rounded-lg bg-[#1F1916]" />
              <div className="h-8 rounded-lg bg-[#1F1916]" />
              <div className="h-8 rounded-lg bg-[#1F1916]" />
            </div>
          </div>
        )}
        {preview === 'Email' && (
          <div className="rounded-xl bg-white text-slate-800 overflow-hidden">
            <div className="bg-linear-to-r from-[#B66A3C] to-[#D9A35E] px-4 py-3 text-[#F6EBDD] font-extrabold">MochaTrade</div>
            <div className="p-4">
              <div className="text-[11px] text-[#A49A92]/70">To: {audience}</div>
              <div className="font-bold mt-1">{template.title}</div>
              <p className="text-sm mt-2 leading-relaxed text-slate-600">{content}</p>
              <div className="text-xs text-[#A49A92] mt-4">— MochaTrade Operations</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function Communications() {
  const { templates, selectedTemplateId, setSelectedTemplateId, sent, setTab } = useDashboard();
  const template = templates.find(t => t.id === selectedTemplateId) ?? templates[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Communications"
        subtitle="Pick a pre-approved template, adjust it, and broadcast to customers"
        right={
          <button onClick={() => setTab('Templates')} className="px-4 py-2 rounded-xl border border-[#2A211D] bg-[#1F1916] text-sm font-semibold text-[#F6EBDD] hover:bg-[#2A211D]">
            Manage templates
          </button>
        }
      />
      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-[300px_1fr] gap-4">
        <Card className="p-4 h-fit">
          <h3 className="text-[15px] font-bold text-[#F6EBDD] mb-3">Templates</h3>
          <div className="space-y-2">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  t.id === template.id ? 'mt-card-active' : 'border-[#2A211D] bg-white/[0.02] hover:bg-[#1F1916]'
                }`}
              >
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TEMPLATE_CATEGORY_STYLE[t.category]}`}>{t.category}</span>
                <div className="text-[13px] font-bold text-[#F6EBDD] mt-2 leading-snug">{t.title}</div>
                <div className="text-[11px] text-[#A49A92] mt-1">{t.channels.length} channels</div>
              </button>
            ))}
          </div>
        </Card>
        <Composer key={template.id} template={template} />
      </div>

      <Card className="p-5">
        <CardTitle icon={<History className="w-4 h-4" />} iconClass="bg-[#48D597]/10 text-[#48D597]" title="Sent Broadcasts" subtitle="Everything sent during this incident" />
        <div className="space-y-2">
          {sent.map(s => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-[#090807] border border-[#2A211D]">
              <CheckCircle2 className="w-5 h-5 text-[#48D597] shrink-0" />
              <span className="text-xs text-[#A49A92] font-mono-numbers w-10">{s.time}</span>
              <span className="text-[13px] font-semibold text-[#F6EBDD] flex-1 min-w-[180px]">{s.title}</span>
              <div className="flex flex-wrap gap-1.5">
                {s.channels.map(c => (
                  <Pill key={c} className="border-[#2A211D] text-[#A49A92]">
                    {CHANNEL_ICONS[c]} {c}
                  </Pill>
                ))}
              </div>
              <span className="text-xs text-[#A49A92]">{s.audience}</span>
              <span className="text-xs font-bold text-[#48D597] font-mono-numbers">{s.reach.toLocaleString('en-US')} reached</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
