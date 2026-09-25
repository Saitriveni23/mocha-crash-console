import { AlertTriangle, BellOff, BellRing, CheckCircle2, ChevronRight, PauseCircle, PhoneCall, PlayCircle, ShieldAlert, Siren } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Avatar, Card, CardTitle, PageHeader, Pill } from '../components/ui';
import { tooltipStyle } from '../lib';
import { TEAM_MEMBERS } from '../mockData';
import { useDashboard } from '../store';
import type { AlertRule } from '../types';

const SEVERITY: Record<AlertRule['severity'], string> = {
  CRITICAL: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  WARNING: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  INFO: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
};

const STATUS: Record<AlertRule['status'], string> = {
  FIRING: 'text-rose-300',
  NORMAL: 'text-emerald-300',
  PAUSED: 'text-slate-400',
};

const ALERT_VOLUME = [
  { t: '10:30', critical: 0, warning: 1 },
  { t: '10:32', critical: 1, warning: 1 },
  { t: '10:34', critical: 3, warning: 2 },
  { t: '10:36', critical: 5, warning: 4 },
  { t: '10:38', critical: 8, warning: 6 },
  { t: '10:40', critical: 12, warning: 7 },
  { t: '10:42', critical: 9, warning: 8 },
  { t: '10:44', critical: 7, warning: 6 },
  { t: '10:46', critical: 6, warning: 5 },
];

export default function Alerts() {
  const { alerts, setAlerts, addLog, notify } = useDashboard();

  const update = (id: string, patch: Partial<AlertRule>) => setAlerts(a => a.map(x => (x.id === id ? { ...x, ...patch } : x)));

  const firing = alerts.filter(a => a.status === 'FIRING');
  const summary = [
    { label: 'Firing', value: firing.filter(a => !a.acknowledged).length, icon: <Siren className="w-5 h-5" />, cls: 'text-rose-300 bg-rose-500/20', glow: 'pink' as const },
    { label: 'Acknowledged', value: firing.filter(a => a.acknowledged).length, icon: <CheckCircle2 className="w-5 h-5" />, cls: 'text-amber-300 bg-amber-500/20', glow: 'amber' as const },
    { label: 'Normal', value: alerts.filter(a => a.status === 'NORMAL').length, icon: <ShieldAlert className="w-5 h-5" />, cls: 'text-emerald-300 bg-emerald-500/20', glow: 'emerald' as const },
    { label: 'Paused', value: alerts.filter(a => a.status === 'PAUSED').length, icon: <BellOff className="w-5 h-5" />, cls: 'text-slate-300 bg-slate-500/20', glow: undefined },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Alerts"
        subtitle="Threshold rules watching liquidations, tickets and sentiment"
        right={
          <button
            onClick={() => {
              setAlerts(a => a.map(x => (x.status === 'FIRING' ? { ...x, acknowledged: true } : x)));
              addLog('Acknowledged all firing alerts', 'Ops');
              notify('All firing alerts acknowledged');
            }}
            className="px-4 py-2 rounded-xl bg-linear-to-r from-rose-600 to-pink-500 text-white text-sm font-bold glow-pink hover:brightness-110"
          >
            Acknowledge all
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4" glow={s.value > 0 ? s.glow : undefined}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-extrabold text-white font-mono-numbers">{s.value}</div>
              <div className="text-xs text-slate-400 font-semibold">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-[1.4fr_1fr] gap-4">
        <div className="space-y-3">
          {firing.map(a => (
            <Card
              key={a.id}
              className={`p-4 ${a.acknowledged ? 'border-amber-500/40' : 'border-rose-500/60 bg-linear-to-r from-[#3a0d25]/90 to-[#161a36]/90'}`}
              glow={a.acknowledged ? undefined : 'pink'}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${a.acknowledged ? 'bg-amber-500/20' : 'bg-rose-500 glow-pink'}`}>
                  {a.acknowledged ? <BellRing className="w-5 h-5 text-amber-300" /> : <AlertTriangle className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-white">{a.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY[a.severity]}`}>{a.severity}</span>
                    {a.acknowledged && <Pill className="border-amber-500/40 text-amber-300">Acknowledged</Pill>}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Rule {a.threshold} · now <span className="text-rose-300 font-bold">{a.metric}</span> · since {a.lastTriggered}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!a.acknowledged && (
                    <button
                      onClick={() => {
                        update(a.id, { acknowledged: true });
                        addLog(`Acknowledged alert: ${a.name}`, 'Ops');
                        notify('Alert acknowledged');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/20 bg-white/5 hover:bg-white/10"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => {
                      addLog(`Escalated alert to on-call: ${a.name}`, 'Ops', 'You (Team Lead)', 'pending');
                      notify('Escalated to on-call lead', 'info');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:brightness-110"
                  >
                    Escalate
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {firing.length === 0 && (
            <Card className="p-8 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" /> No alerts firing. All rules are within bounds.
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <CardTitle icon={<BellRing className="w-4 h-4" />} title="Alert Volume" subtitle="Alerts raised per 2 minutes" />
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ALERT_VOLUME} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="critical" name="Critical" stackId="a" fill="#ff2a5f" isAnimationActive={false} />
                  <Bar dataKey="warning" name="Warning" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <CardTitle icon={<PhoneCall className="w-4 h-4" />} iconClass="bg-blue-500/20 text-blue-300" title="Escalation Chain" subtitle="Who gets paged, in order" />
            <div className="space-y-2">
              {TEAM_MEMBERS.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03] border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-purple-500/25 text-purple-200 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <Avatar member={m} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">{m.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{m.role}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <CardTitle icon={<ShieldAlert className="w-4 h-4" />} iconClass="bg-purple-500/20 text-purple-300" title="Alert Rules" subtitle="Pause a rule to silence it during the incident" />
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[13px] min-w-[760px]">
            <thead>
              <tr className="text-[11px] text-slate-400 text-left border-b border-white/5">
                <th className="font-semibold py-2 pr-3">Rule</th>
                <th className="font-semibold py-2 pr-3">Severity</th>
                <th className="font-semibold py-2 pr-3">Threshold</th>
                <th className="font-semibold py-2 pr-3">Current</th>
                <th className="font-semibold py-2 pr-3">Status</th>
                <th className="font-semibold py-2 pr-3">Last triggered</th>
                <th className="font-semibold py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-3 font-semibold text-white">{a.name}</td>
                  <td className="py-3 pr-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY[a.severity]}`}>{a.severity}</span>
                  </td>
                  <td className="py-3 pr-3 text-slate-300 font-mono-numbers text-xs">{a.threshold}</td>
                  <td className="py-3 pr-3 text-slate-200 font-mono-numbers text-xs">{a.metric}</td>
                  <td className={`py-3 pr-3 font-bold text-xs ${STATUS[a.status]}`}>{a.status}</td>
                  <td className="py-3 pr-3 text-slate-400 text-xs">{a.lastTriggered}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        const paused = a.status === 'PAUSED';
                        update(a.id, { status: paused ? 'NORMAL' : 'PAUSED' });
                        notify(paused ? 'Rule resumed' : 'Rule paused', 'info');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      {a.status === 'PAUSED' ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                      {a.status === 'PAUSED' ? 'Resume' : 'Pause'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
