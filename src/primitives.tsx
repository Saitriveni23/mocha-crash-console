import type { ReactNode } from 'react';
import { Avatar } from './components/ui';
import type { TeamMember } from './types';

// ─── Shared primitives used in all pages ─────────────────────────────────────

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mt-card ${className}`}>{children}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mt-section-label mb-3">{children}</div>;
}

export function GoldDivider() {
  return <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D9A35E]/30 to-transparent my-4" />;
}

export function LivePulse() {
  return (
    <span className="flex items-center gap-1.5 text-[#48D597] text-xs font-bold">
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#48D597] opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#48D597]" />
      </span>
      LIVE
    </span>
  );
}

export function StatCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral' }) {
  const trendColor = trend === 'up' ? '#48D597' : trend === 'down' ? '#F87171' : '#A49A92';
  return (
    <div className="mt-card p-4 flex flex-col gap-1">
      <div className="mt-section-label">{label}</div>
      <div className="text-2xl font-bold tracking-tight" style={{ color: trendColor === '#A49A92' ? '#F6EBDD' : trendColor }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: trendColor }}>{sub}</div>}
    </div>
  );
}

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-[#F6EBDD] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#A49A92] mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function TeamAvatarRow({ members }: { members: TeamMember[] }) {
  return (
    <div className="flex -space-x-2">
      {members.map(m => <Avatar key={m.id} member={m} size={28} ring="border-[#090807]" />)}
    </div>
  );
}
