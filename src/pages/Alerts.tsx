import {
  AlertTriangle, BellOff, BellRing, CheckCircle2, ClipboardList,
  PauseCircle, PlayCircle, ShieldAlert, Siren,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Avatar, Card, CardTitle, PageHeader } from '../components/ui';
import { TEAM_MEMBERS } from '../mockData';
import { useDashboard } from '../store';
import type { AlertRule } from '../types';

const SEVERITY: Record<AlertRule['severity'], string> = {
  CRITICAL: 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30',
  WARNING:  'bg-[#D9A35E]/10 text-[#D9A35E] border-[#D9A35E]/30',
  INFO:     'bg-[#A49A92]/10 text-[#A49A92] border-[#A49A92]/30',
};

const STATUS: Record<AlertRule['status'], string> = {
  FIRING: 'text-[#F87171]',
  NORMAL: 'text-[#48D597]',
  PAUSED: 'text-[#A49A92]',
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

const goldTooltip = {
  contentStyle: { background: '#1F1916', border: '1px solid #2A211D', borderRadius: 14, color: '#F6EBDD', fontSize: 12 },
  itemStyle: { color: '#D9A35E' },
};

export default function Alerts() {
  const { alerts, setAlerts, addLog, notify, riskReport } = useDashboard();

  const update = (id: string, patch: Partial<AlertRule>) =>
    setAlerts(a => a.map(x => (x.id === id ? { ...x, ...patch } : x)));

  const firing = alerts.filter(a => a.status === 'FIRING');
  const summary = [
    { label: 'Firing',        value: firing.filter(a => !a.acknowledged).length, icon: <Siren       className="w-5 h-5" />, cls: 'text-[#F87171] bg-[#F87171]/10' },
    { label: 'Acknowledged',  value: firing.filter(a => a.acknowledged).length,  icon: <CheckCircle2 className="w-5 h-5" />, cls: 'text-[#D9A35E] bg-[#D9A35E]/10' },
    { label: 'Normal',        value: alerts.filter(a => a.status === 'NORMAL').length, icon: <ShieldAlert className="w-5 h-5" />, cls: 'text-[#48D597] bg-[#48D597]/10' },
    { label: 'Paused',        value: alerts.filter(a => a.status === 'PAUSED').length, icon: <BellOff className="w-5 h-5" />, cls: 'text-[#A49A92] bg-[#A49A92]/10' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Incident Command Center"
        subtitle="Threshold rules watching liquidations, tickets and sentiment"
        right={
          <button
            onClick={() => {
              setAlerts(a => a.map(x => (x.status === 'FIRING' ? { ...x, acknowledged: true } : x)));
              addLog('Acknowledged all firing alerts', 'Ops');
              notify('All firing alerts acknowledged');
            }}
            className="mt-btn-primary"
          >
            Acknowledge all
          </button>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-[#F6EBDD] font-mono-numbers">{s.value}</div>
              <div className="text-xs text-[#A49A92] font-semibold mt-0.5">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Risk Breakdown */}
      <Card className="p-5">
        <CardTitle
          icon={<ClipboardList className="w-4 h-4" />}
          iconClass="bg-[#D9A35E]/15 text-[#D9A35E]"
          title={`Risk Report · Score ${riskReport.score} — ${riskReport.level}`}
          subtitle={riskReport.summary}
        />
        <div className="space-y-3 mb-4">
          {riskReport.factors.map(f => (
            <div key={f.key} className="bg-[#090807] rounded-xl p-3 border border-[#2A211D]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-[#F6EBDD]">{f.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${f.riskScore >= 70 ? 'text-[#F87171] border-[#F87171]/30 bg-[#F87171]/10' : f.riskScore >= 40 ? 'text-[#D9A35E] border-[#D9A35E]/30 bg-[#D9A35E]/10' : 'text-[#48D597] border-[#48D597]/30 bg-[#48D597]/10'}`}>
                  {f.riskScore}/100
                </span>
              </div>
              <div className="h-1.5 bg-[#2A211D] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${f.riskScore}%`,
                    background: f.riskScore >= 70 ? '#F87171' : f.riskScore >= 40 ? '#D9A35E' : '#48D597',
                  }}
                />
              </div>
              <p className="text-xs text-[#A49A92] mt-1.5">{f.explanation}</p>
            </div>
          ))}
        </div>
        {riskReport.actions.length > 0 && (
          <div className="rounded-2xl border border-[#D9A35E]/20 bg-[#D9A35E]/5 p-4">
            <div className="mt-section-label mb-2">Auto-Generated Action Plan</div>
            <ul className="space-y-1.5">
              {riskReport.actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#F6EBDD]">
                  <span className="w-4 h-4 rounded-full bg-[#D9A35E]/20 border border-[#D9A35E]/30 text-[#D9A35E] text-[9px] font-bold flex items-center justify-center mt-0.5 shrink-0">{i + 1}</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Alert volume chart */}
      <Card className="p-5">
        <CardTitle icon={<BellRing className="w-4 h-4" />} iconClass="bg-[#F87171]/15 text-[#F87171]" title="Alert Volume Timeline" subtitle="Critical vs warning triggers during incident window" />
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ALERT_VOLUME} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="#2A211D" vertical={false} />
              <XAxis dataKey="t" stroke="#A49A92" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#A49A92" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip {...goldTooltip} />
              <Bar dataKey="critical" fill="#F87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="warning"  fill="#D9A35E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Alert Rules */}
      <Card className="p-5">
        <CardTitle icon={<ShieldAlert className="w-4 h-4" />} iconClass="bg-[#D9A35E]/15 text-[#D9A35E]" title="Alert Rules" subtitle="Live threshold monitoring for market crash signals" />
        <div className="space-y-2">
          {alerts.map(a => (
            <div key={a.id} className="flex flex-wrap items-start gap-3 rounded-2xl border border-[#2A211D] bg-[#090807] p-4 hover:border-[#D9A35E]/20 transition-colors">
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-[#F6EBDD]">{a.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY[a.severity]}`}>{a.severity}</span>
                  {a.acknowledged && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D9A35E]/30 bg-[#D9A35E]/10 text-[#D9A35E]">Acked</span>}
                </div>
                <div className="text-xs text-[#A49A92] mt-1">{a.threshold} · Current: <span className={`font-bold ${a.status === 'FIRING' ? 'text-[#F87171]' : 'text-[#48D597]'}`}>{a.metric}</span></div>
                <div className="text-xs text-[#A49A92] mt-0.5">Last triggered: {a.lastTriggered}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${STATUS[a.status]}`}>{a.status}</span>
                {a.status !== 'PAUSED' ? (
                  <button onClick={() => { update(a.id, { status: 'PAUSED' }); addLog(`Paused alert: ${a.name}`, 'Ops'); notify(`Paused: ${a.name}`, 'info'); }} className="mt-btn-ghost flex items-center gap-1"><PauseCircle className="w-3.5 h-3.5" /> Pause</button>
                ) : (
                  <button onClick={() => { update(a.id, { status: 'NORMAL' }); notify(`Resumed: ${a.name}`, 'success'); }} className="mt-btn-ghost flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> Resume</button>
                )}
                {a.status === 'FIRING' && !a.acknowledged && (
                  <button onClick={() => { update(a.id, { acknowledged: true }); addLog(`Acknowledged: ${a.name}`, 'Ops'); notify('Alert acknowledged'); }} className="mt-btn-primary">Acknowledge</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Team Response */}
      <Card className="p-5">
        <CardTitle icon={<AlertTriangle className="w-4 h-4" />} iconClass="bg-[#D9A35E]/15 text-[#D9A35E]" title="Team Response Board" subtitle="On-call availability during incident" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {TEAM_MEMBERS.map(m => (
            <div key={m.id} className="rounded-2xl border border-[#2A211D] bg-[#090807] p-3 flex flex-col items-center gap-2 text-center hover:border-[#D9A35E]/20 transition-colors">
              <Avatar member={m} size={36} />
              <div className="text-xs font-bold text-[#F6EBDD]">{m.shortName}</div>
              <div className="text-[10px] text-[#A49A92]">{m.role}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status === 'Online' ? 'bg-[#48D597]/10 text-[#48D597] border border-[#48D597]/25' : m.status === 'Active' ? 'bg-[#D9A35E]/10 text-[#D9A35E] border border-[#D9A35E]/25' : 'bg-[#A49A92]/10 text-[#A49A92] border border-[#A49A92]/25'}`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
