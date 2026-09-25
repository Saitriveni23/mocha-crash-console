import type { LogCategory, TemplateCategory } from './types';

export const CATEGORY_STYLES: Record<LogCategory, string> = {
  Market: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  Support: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  Comms: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  Ops: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
  Pending: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
};

export const CATEGORY_DOTS: Record<LogCategory, string> = {
  Market: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
  Support: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
  Comms: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
  Ops: 'bg-purple-500 shadow-[0_0_8px_#a855f7]',
  Pending: 'bg-slate-400',
};

export const tooltipStyle = {
  contentStyle: {
    background: 'rgba(12, 15, 30, 0.95)',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    fontSize: 12,
  },
  itemStyle: { color: '#e2e8f0', fontWeight: 600 },
  labelStyle: { color: '#94a3b8', fontWeight: 600 },
};

export const formatNumber = (n: number) => Math.round(n).toLocaleString('en-US');

export const pctAbove = (value: number, base: number) => `${value >= base ? '+' : ''}${Math.round((value / base - 1) * 100)}%`;

export const formatElapsed = (s: number) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map(n => String(n).padStart(2, '0'));

export const TEMPLATE_CATEGORY_STYLE: Record<TemplateCategory, string> = {
  Critical: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  Support: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  Recovery: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  Advisory: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
};
