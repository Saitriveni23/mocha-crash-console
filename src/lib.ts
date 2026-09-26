import type { LogCategory, TemplateCategory } from './types';

export const CATEGORY_STYLES: Record<LogCategory, string> = {
  Market:  'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30',
  Support: 'bg-[#D9A35E]/10 text-[#D9A35E] border-[#D9A35E]/30',
  Comms:   'bg-[#48D597]/10 text-[#48D597] border-[#48D597]/30',
  Ops:     'bg-[#B66A3C]/10 text-[#B66A3C] border-[#B66A3C]/30',
  Pending: 'bg-[#A49A92]/10 text-[#A49A92] border-[#A49A92]/30',
};

export const CATEGORY_DOTS: Record<LogCategory, string> = {
  Market:  'bg-[#F87171]',
  Support: 'bg-[#D9A35E]',
  Comms:   'bg-[#48D597]',
  Ops:     'bg-[#B66A3C]',
  Pending: 'bg-[#A49A92]',
};

export const tooltipStyle = {
  contentStyle: {
    background: '#1F1916',
    border: '1px solid #2A211D',
    borderRadius: 14,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    fontSize: 12,
    color: '#F6EBDD',
  },
  itemStyle:  { color: '#D9A35E', fontWeight: 600 },
  labelStyle: { color: '#A49A92', fontWeight: 600 },
};

export const formatNumber = (n: number) => Math.round(n).toLocaleString('en-US');

export const pctAbove = (value: number, base: number) =>
  `${value >= base ? '+' : ''}${Math.round((value / base - 1) * 100)}%`;

export const formatElapsed = (s: number) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map(n => String(n).padStart(2, '0'));

export const TEMPLATE_CATEGORY_STYLE: Record<TemplateCategory, string> = {
  Critical: 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30',
  Support:  'bg-[#D9A35E]/10 text-[#D9A35E] border-[#D9A35E]/30',
  Recovery: 'bg-[#48D597]/10 text-[#48D597] border-[#48D597]/30',
  Advisory: 'bg-[#A49A92]/10 text-[#A49A92] border-[#A49A92]/30',
};
