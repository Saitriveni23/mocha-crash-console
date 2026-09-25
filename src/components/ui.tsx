import { Check, ArrowRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { CATEGORY_STYLES } from '../lib';
import type { CoinType, IncidentStep, LogCategory, TeamMember } from '../types';

export function Card({
  children,
  className = '',
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: 'pink' | 'purple' | 'amber' | 'cyan' | 'emerald';
}) {
  return (
    <div className={`cyber-card rounded-2xl relative overflow-hidden ${glow ? `glow-${glow}` : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  icon,
  title,
  subtitle,
  right,
  iconClass = 'bg-pink-500/15 text-pink-400',
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${iconClass}`}>{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-white truncate">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium truncate">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

const COINS: Record<CoinType, { bg: string; glyph: string }> = {
  btc: { bg: 'bg-[#f7931a]', glyph: '₿' },
  eth: { bg: 'bg-[#627eea]', glyph: 'Ξ' },
  sol: { bg: 'bg-linear-to-br from-[#9945ff] to-[#14f195]', glyph: '◎' },
  bnb: { bg: 'bg-[#f3ba2f]', glyph: '◆' },
  xrp: { bg: 'bg-slate-600', glyph: '✕' },
};

export function CoinIcon({ coin, size = 32 }: { coin: CoinType; size?: number }) {
  const c = COINS[coin];
  return (
    <div
      className={`${c.bg} rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {c.glyph}
    </div>
  );
}

export function Avatar({ member, size = 40, ring }: { member: TeamMember; size?: number; ring?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = member.shortName.slice(0, 2).toUpperCase();
  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 border-2 ${ring ?? 'border-[#1e2748]'} bg-linear-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold`}
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

export function LiveDot({ color = 'bg-emerald-400' }: { color?: string }) {
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
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-linear-to-r from-pink-500 to-purple-500 glow-pink' : 'bg-[#1e2748]'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export function Sparkline({
  data,
  dataKey = 'v',
  color,
  id,
  height = 70,
}: {
  data: object[];
  dataKey?: string;
  color: string;
  id: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${id})`}
          isAnimationActive={false}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StepIcon({ step }: { step: IncidentStep }) {
  if (step.status === 'Completed')
    return (
      <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center glow-emerald">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
    );
  if (step.status === 'In progress')
    return (
      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step.step === 1 ? 'bg-emerald-500 glow-emerald' : 'bg-blue-500 glow-cyan'}`}>
        {step.step === 1 ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : <ArrowRight className="w-3 h-3 text-white rotate-90" strokeWidth={3} />}
      </span>
    );
  return <span className="w-5 h-5 rounded-full border-2 border-slate-400" />;
}
