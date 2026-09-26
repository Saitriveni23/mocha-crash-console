import { Check, ArrowRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { CATEGORY_STYLES } from '../lib';
import type { CoinType, IncidentStep, LogCategory, TeamMember } from '../types';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mt-card ${className}`}>{children}</div>;
}

export function CardTitle({
  icon, title, subtitle, right,
  iconClass = 'bg-[#D9A35E]/15 text-[#D9A35E]',
}: {
  icon?: ReactNode; title: ReactNode; subtitle?: ReactNode; right?: ReactNode; iconClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${iconClass}`}>{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-[#F6EBDD] truncate">{title}</h3>
          {subtitle && <p className="text-xs text-[#A49A92] font-medium truncate mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-[#F6EBDD] tracking-tight">{title}</h1>
        <p className="text-sm text-[#A49A92] font-medium mt-1">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

const COINS: Record<CoinType, { bg: string; glyph: string }> = {
  btc: { bg: 'bg-[#f7931a]', glyph: '₿' },
  eth: { bg: 'bg-[#627eea]', glyph: 'Ξ' },
  sol: { bg: 'bg-gradient-to-br from-[#9945ff] to-[#14f195]', glyph: '◎' },
  bnb: { bg: 'bg-[#f3ba2f]', glyph: '◆' },
  xrp: { bg: 'bg-[#A49A92]', glyph: '✕' },
};

export function CoinIcon({ coin, size = 32 }: { coin: CoinType; size?: number }) {
  const c = COINS[coin];
  return (
    <div className={`${c.bg} rounded-full flex items-center justify-center text-white font-bold shrink-0`} style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {c.glyph}
    </div>
  );
}

export function Avatar({ member, size = 40, ring }: { member: TeamMember; size?: number; ring?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = member.shortName.slice(0, 2).toUpperCase();
  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 border-2 ${ring ?? 'border-[#2A211D]'} bg-gradient-to-br from-[#D9A35E] to-[#B66A3C] flex items-center justify-center text-[#090807] font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {failed ? initials : (
        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export function CategoryBadge({ category }: { category: LogCategory }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${CATEGORY_STYLES[category]}`}>
      {category}
    </span>
  );
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${className}`}>
      {children}
    </span>
  );
}

export function LiveDot({ color = 'bg-[#48D597]' }: { color?: string }) {
  return (
    <span className="relative flex w-2 h-2">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`} />
      <span className={`relative inline-flex rounded-full w-2 h-2 ${color}`} />
    </span>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button" role="switch" aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-gradient-to-r from-[#D9A35E] to-[#B66A3C]' : 'bg-[#2A211D]'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export function Sparkline({ data, dataKey = 'v', color, id, height = 70 }: {
  data: object[]; dataKey?: string; color: string; id: string; height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StepIcon({ step }: { step: IncidentStep }) {
  if (step.status === 'Completed')
    return (
      <span className="w-5 h-5 rounded-full bg-[#48D597] flex items-center justify-center">
        <Check className="w-3 h-3 text-[#090807]" strokeWidth={3} />
      </span>
    );
  if (step.status === 'In progress')
    return (
      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#D9A35E]">
        <ArrowRight className="w-3 h-3 text-[#090807] rotate-90" strokeWidth={3} />
      </span>
    );
  return <span className="w-5 h-5 rounded-full border-2 border-[#2A211D]" />;
}
