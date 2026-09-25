import { AlertCircle, AlertTriangle, BellRing, CheckCircle2, Eye, ExternalLink, MapPin, MessageSquareText, Radio, Send, ShieldAlert, Users } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Card, CardTitle, PageHeader, Pill } from '../components/ui';
import WorldMap from '../components/WorldMap';
import { REGIONAL_HOTSPOTS, TEAM_MEMBERS, TEAM_WORKLOAD } from '../mockData';
import { useDashboard } from '../store';

const severityStyle = {
  CRITICAL: 'border-rose-500/60 bg-rose-500/10 text-rose-300',
  WARNING: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
  INFO: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
};

export default function Overview() {
  const { alerts, userAlerts, riskReport, setAlerts, dismissUserAlert, setTab, addLog, notify, responseActions, updateResponseAction, activeUserId } = useDashboard();
  const [selectedHotspot, setSelectedHotspot] = useState(REGIONAL_HOTSPOTS[0].id);
  const firing = alerts.filter(alert => alert.status === 'FIRING');
  const hasAlerts = firing.length > 0 || userAlerts.length > 0;

  const acknowledge = (id: string, name: string) => {
    setAlerts(items => items.map(item => item.id === id ? { ...item, acknowledged: true } : item));
    addLog(`Acknowledged alert: ${name}`, 'Ops');
    notify('Alert acknowledged');
  };

  const escalate = (name: string) => {
    addLog(`Escalated alert to on-call: ${name}`, 'Ops', 'You (Team Lead)', 'pending');
    notify('Alert escalated to on-call', 'info');
  };

  const currentTask = responseActions.find(action => action.status !== 'Completed' && action.stage === riskReport.phase) ?? responseActions.find(action => action.status !== 'Completed');
  const hotspot = REGIONAL_HOTSPOTS.find(item => item.id === selectedHotspot) ?? REGIONAL_HOTSPOTS[0];
  const runQuickAction = (label: string, tab: 'Alerts' | 'Live Feeds' | 'Communications' | 'Incident Log') => {
    addLog(`Quick action opened: ${label}`, 'Ops');
    setTab(tab);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Live Alerts" subtitle="Real-time incident signals requiring the ops team’s attention" right={<Pill className="border-amber-400/40 text-amber-200">SIMULATION MODE</Pill>} />

      <Card className={`p-5 ${hasAlerts ? 'border-rose-500/40' : 'border-emerald-500/30'}`}>
        <CardTitle
          icon={hasAlerts ? <BellRing className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          iconClass={hasAlerts ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}
          title={hasAlerts ? `${firing.length + userAlerts.length} active alert${firing.length + userAlerts.length === 1 ? '' : 's'}` : 'No active alerts'}
          subtitle={`Risk score ${riskReport.score} · ${riskReport.level}`}
          right={<button onClick={() => setTab('Alerts')} className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1">Open alert center <ExternalLink className="w-3.5 h-3.5" /></button>}
        />

        {!hasAlerts && <div className="rounded-xl border border-dashed border-white/15 p-10 text-center text-sm text-slate-400"><CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />The incident monitor is quiet. New alerts will appear here automatically.</div>}

        <div className="space-y-3">
          {firing.map(alert => (
            <div key={alert.id} className={`rounded-xl border p-4 ${alert.acknowledged ? 'border-amber-500/40 bg-amber-500/5' : 'border-rose-500/60 bg-rose-500/10'}`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${alert.acknowledged ? 'bg-amber-500/20' : 'bg-rose-500/20'}`}><AlertTriangle className="w-4 h-4 text-rose-300" /></div>
                <div className="flex-1 min-w-[220px]"><div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-white">{alert.name}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityStyle[alert.severity]}`}>{alert.severity}</span>{alert.acknowledged && <Pill className="border-amber-500/40 text-amber-300">Acknowledged</Pill>}</div><div className="text-xs text-slate-400 mt-1">{alert.threshold} · Current: <span className="text-rose-300 font-bold">{alert.metric}</span></div></div>
                <div className="flex gap-2"><button onClick={() => acknowledge(alert.id, alert.name)} disabled={alert.acknowledged} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40">Acknowledge</button><button onClick={() => escalate(alert.name)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:brightness-110">Escalate</button></div>
              </div>
            </div>
          ))}

          {userAlerts.map(alert => (
            <div key={alert.id} className={`rounded-xl border p-4 ${alert.type === 'CRITICAL' ? severityStyle.CRITICAL : severityStyle.WARNING}`}>
              <div className="flex flex-wrap items-start gap-3"><div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">{alert.type === 'CRITICAL' ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}</div><div className="flex-1 min-w-[220px]"><div className="flex items-center gap-2"><span className="font-bold text-white">TCS {alert.type === 'CRITICAL' ? 'threshold crossed' : 'approaching threshold'}</span><span className="text-xs text-slate-400">{alert.time}</span></div><div className="text-sm text-slate-200 mt-1">{alert.message}</div><div className="text-xs text-slate-400 mt-1">Price: ₹{alert.price.toLocaleString('en-IN')} · Threshold: ₹{alert.threshold.toLocaleString('en-IN')}</div></div><div className="flex gap-2"><button onClick={() => setTab('Market Monitor')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/15"><Eye className="w-3.5 h-3.5" /> View</button><button onClick={() => dismissUserAlert(alert.id)} className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-bold text-slate-300 hover:bg-white/5">Dismiss</button></div></div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <Card className="p-4 border-purple-500/35">
          <CardTitle icon={<ShieldAlert className="w-4 h-4" />} iconClass="bg-purple-500/20 text-purple-300" title="10-Minute Action Prompt" subtitle={`${riskReport.phase} · complete one task before the next review`} right={<Pill className="border-purple-400/40 text-purple-200">{riskReport.nextUpdateInSeconds ? `${Math.floor(riskReport.nextUpdateInSeconds / 60)}m ${riskReport.nextUpdateInSeconds % 60}s` : 'Final stage'}</Pill>} />
          {currentTask ? <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4"><div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Current owner</div><div className="flex items-center gap-3 mt-2"><Avatar member={TEAM_MEMBERS.find(member => member.id === currentTask.ownerId) ?? TEAM_MEMBERS[0]} size={34} /><div className="flex-1"><div className="text-sm font-bold text-white">{currentTask.text}</div><div className="text-xs text-slate-400 mt-1">{(TEAM_MEMBERS.find(member => member.id === currentTask.ownerId) ?? TEAM_MEMBERS[0]).name}</div></div>{currentTask.ownerId === activeUserId ? <button onClick={() => updateResponseAction(currentTask.id, { status: 'Completed' })} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30">Finish task</button> : <span className="px-3 py-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 text-xs font-bold text-amber-200">Awaiting {(TEAM_MEMBERS.find(member => member.id === currentTask.ownerId) ?? TEAM_MEMBERS[0]).shortName}</span>}</div></div> : <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">All assigned response tasks are complete for this incident stage.</div>}
          <div className="text-xs text-slate-400 mt-3">Prompt source: the staged action-plan template and current risk score ({riskReport.score}, {riskReport.level}).</div>
        </Card>

        <Card className="p-4">
          <CardTitle icon={<Users className="w-4 h-4" />} iconClass="bg-emerald-500/20 text-emerald-300" title="Team View · Optimal Work Split" subtitle="Keep one person on decisions, one on market truth, one on customers" />
          <div className="space-y-2">{TEAM_WORKLOAD.map(work => { const member = TEAM_MEMBERS.find(item => item.id === work.memberId) ?? TEAM_MEMBERS[0]; return <div key={work.memberId} className="flex items-center gap-3"><Avatar member={member} size={30} /><div className="flex-1 min-w-0"><div className="flex justify-between gap-2 text-xs"><span className="font-bold text-white">{member.shortName}</span><span className="text-emerald-300 font-mono-numbers">{work.allocation}%</span></div><div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1"><div className="h-full bg-linear-to-r from-emerald-400 to-cyan-400" style={{ width: `${work.allocation}%` }} /></div><div className="text-[10px] text-slate-500 mt-1">{work.focus}</div></div></div>; })}</div>
        </Card>
      </div>

      <Card className="p-4">
        <CardTitle icon={<MapPin className="w-4 h-4" />} iconClass="bg-rose-500/20 text-rose-300" title="Regional Liquidation State" subtitle="Select a hotspot to inspect the regional signal and response context" />
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
          <div className="h-[250px] rounded-xl border border-white/5 bg-[#0c0f1e]/50 p-2"><WorldMap hotspots={REGIONAL_HOTSPOTS} labelled={REGIONAL_HOTSPOTS.filter(item => item.type === 'liquidation').map(item => item.id)} selectedId={selectedHotspot} onSelect={setSelectedHotspot} /></div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 flex flex-col justify-center"><div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Selected region</div><div className="text-xl font-extrabold text-white mt-1">{hotspot.city}</div><div className="text-sm text-rose-300 font-semibold mt-2">{hotspot.label}</div><div className="text-2xl font-bold text-white mt-3">{hotspot.stat}</div><div className="text-xs text-slate-400 mt-2">Regional response signal: {hotspot.type === 'liquidation' ? 'review affected positions and liquidity routing' : hotspot.type === 'tickets' ? 'assign support triage and customer messaging' : 'validate sentiment and oracle conditions'}.</div></div>
        </div>
      </Card>

      <Card className="p-4">
        <CardTitle icon={<Radio className="w-4 h-4" />} iconClass="bg-amber-500/20 text-amber-300" title="Quick Actions" subtitle="Open the next operational view and record the decision context" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2"><button onClick={() => runQuickAction('Review firing alerts', 'Alerts')} className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-bold text-rose-200 hover:bg-rose-500/20"><ShieldAlert className="w-4 h-4" /> Review alerts</button><button onClick={() => runQuickAction('Review live liquidation feed', 'Live Feeds')} className="flex items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 py-3 text-xs font-bold text-purple-200 hover:bg-purple-500/20"><Radio className="w-4 h-4" /> Review feed</button><button onClick={() => runQuickAction('Prepare customer broadcast', 'Communications')} className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 py-3 text-xs font-bold text-blue-200 hover:bg-blue-500/20"><Send className="w-4 h-4" /> Prepare comms</button><button onClick={() => runQuickAction('Open incident decision log', 'Incident Log')} className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-3 text-xs font-bold text-emerald-200 hover:bg-emerald-500/20"><MessageSquareText className="w-4 h-4" /> Log decision</button></div>
      </Card>
    </div>
  );
}
