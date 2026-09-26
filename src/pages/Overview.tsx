import {
  AlertCircle, AlertTriangle, BellRing, CheckCircle2, ExternalLink,
  MapPin, MessageSquareText, Radio, Send, ShieldAlert, Users, Eye,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, Card, CardTitle, PageHeader } from '../components/ui';
import WorldMap from '../components/WorldMap';
import { REGIONAL_HOTSPOTS, TEAM_MEMBERS, TEAM_WORKLOAD } from '../mockData';
import { useDashboard } from '../store';

const severityStyle = {
  CRITICAL: 'border-[#F87171]/40 bg-[#F87171]/8 text-[#F87171]',
  WARNING:  'border-[#D9A35E]/40 bg-[#D9A35E]/8 text-[#D9A35E]',
  INFO:     'border-[#A49A92]/30 bg-[#A49A92]/8 text-[#A49A92]',
};

export default function Overview() {
  const { alerts, userAlerts, riskReport, setAlerts, dismissUserAlert, setTab, addLog, notify, responseActions, updateResponseAction, activeUserId } = useDashboard();
  const [selectedHotspot, setSelectedHotspot] = useState(REGIONAL_HOTSPOTS[0].id);
  const firing = alerts.filter(a => a.status === 'FIRING');
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

  const currentTask = responseActions.find(a => a.status !== 'Completed' && a.stage === riskReport.phase) ?? responseActions.find(a => a.status !== 'Completed');
  const hotspot = REGIONAL_HOTSPOTS.find(h => h.id === selectedHotspot) ?? REGIONAL_HOTSPOTS[0];

  return (
    <div className="space-y-5">
      <PageHeader title="Executive Dashboard" subtitle="Live incident signals and team coordination" right={<span className="mt-gold-badge">SIMULATION MODE</span>} />

      {/* Risk Score Banner */}
      <Card className={`p-4 ${hasAlerts ? 'border-[#F87171]/30' : 'border-[#48D597]/25'}`}>
        <CardTitle
          icon={hasAlerts ? <BellRing className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          iconClass={hasAlerts ? 'bg-[#F87171]/15 text-[#F87171]' : 'bg-[#48D597]/15 text-[#48D597]'}
          title={hasAlerts ? `${firing.length + userAlerts.length} active alert${firing.length + userAlerts.length === 1 ? '' : 's'}` : 'No active alerts'}
          subtitle={`Risk score ${riskReport.score} · ${riskReport.level}`}
          right={<button onClick={() => setTab('Alerts')} className="text-xs font-semibold text-[#A49A92] hover:text-[#D9A35E] flex items-center gap-1 transition-colors">Alert center <ExternalLink className="w-3.5 h-3.5" /></button>}
        />

        {!hasAlerts && (
          <div className="rounded-2xl border border-dashed border-[#2A211D] p-10 text-center text-sm text-[#A49A92]">
            <CheckCircle2 className="w-8 h-8 text-[#48D597] mx-auto mb-2" />
            The incident monitor is quiet. New alerts will appear here automatically.
          </div>
        )}

        <div className="space-y-3">
          {firing.map(alert => (
            <div key={alert.id} className={`rounded-2xl border p-4 ${alert.acknowledged ? 'border-[#D9A35E]/30 bg-[#D9A35E]/5' : 'border-[#F87171]/30 bg-[#F87171]/8'}`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${alert.acknowledged ? 'bg-[#D9A35E]/15' : 'bg-[#F87171]/15'}`}>
                  <AlertTriangle className="w-4 h-4 text-[#F87171]" />
                </div>
                <div className="flex-1 min-w-[220px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#F6EBDD] text-sm">{alert.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityStyle[alert.severity]}`}>{alert.severity}</span>
                    {alert.acknowledged && <span className="mt-amber-badge">Acknowledged</span>}
                  </div>
                  <div className="text-xs text-[#A49A92] mt-1">{alert.threshold} · Current: <span className="text-[#F87171] font-bold">{alert.metric}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acknowledge(alert.id, alert.name)} disabled={alert.acknowledged} className="mt-btn-ghost disabled:opacity-40">Acknowledge</button>
                  <button onClick={() => escalate(alert.name)} className="mt-btn-primary">Escalate</button>
                </div>
              </div>
            </div>
          ))}

          {userAlerts.map(alert => (
            <div key={alert.id} className={`rounded-2xl border p-4 ${alert.type === 'CRITICAL' ? severityStyle.CRITICAL : severityStyle.WARNING}`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D9A35E]/10 flex items-center justify-center shrink-0">
                  {alert.type === 'CRITICAL' ? <AlertCircle className="w-4 h-4 text-[#F87171]" /> : <AlertTriangle className="w-4 h-4 text-[#D9A35E]" />}
                </div>
                <div className="flex-1 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F6EBDD] text-sm">TCS {alert.type === 'CRITICAL' ? 'threshold crossed' : 'approaching threshold'}</span>
                    <span className="text-xs text-[#A49A92]">{alert.time}</span>
                  </div>
                  <div className="text-sm text-[#F6EBDD] mt-1">{alert.message}</div>
                  <div className="text-xs text-[#A49A92] mt-1">Price: ₹{alert.price.toLocaleString('en-IN')} · Threshold: ₹{alert.threshold.toLocaleString('en-IN')}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTab('Market Monitor')} className="mt-btn-ghost flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> View</button>
                  <button onClick={() => dismissUserAlert(alert.id)} className="mt-btn-ghost">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action + Team */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-4 border-[#D9A35E]/20">
          <CardTitle
            icon={<ShieldAlert className="w-4 h-4" />}
            iconClass="bg-[#D9A35E]/15 text-[#D9A35E]"
            title="10-Minute Action Prompt"
            subtitle={`${riskReport.phase} · complete one task before the next review`}
            right={<span className="mt-gold-badge">{riskReport.nextUpdateInSeconds ? `${Math.floor(riskReport.nextUpdateInSeconds / 60)}m ${riskReport.nextUpdateInSeconds % 60}s` : 'Final'}</span>}
          />
          {currentTask ? (
            <div className="rounded-2xl bg-[#090807] border border-[#2A211D] p-4">
              <div className="mt-section-label">Current owner</div>
              <div className="flex items-center gap-3 mt-2">
                <Avatar member={TEAM_MEMBERS.find(m => m.id === currentTask.ownerId) ?? TEAM_MEMBERS[0]} size={36} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#F6EBDD]">{currentTask.text}</div>
                  <div className="text-xs text-[#A49A92] mt-0.5">{(TEAM_MEMBERS.find(m => m.id === currentTask.ownerId) ?? TEAM_MEMBERS[0]).name}</div>
                </div>
                {currentTask.ownerId === activeUserId ? (
                  <button onClick={() => updateResponseAction(currentTask.id, { status: 'Completed' })} className="mt-btn-primary">Finish task</button>
                ) : (
                  <span className="mt-amber-badge">Awaiting {(TEAM_MEMBERS.find(m => m.id === currentTask.ownerId) ?? TEAM_MEMBERS[0]).shortName}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#48D597]/25 bg-[#48D597]/8 p-4 text-sm text-[#48D597]">All assigned response tasks are complete for this stage.</div>
          )}
          <p className="text-xs text-[#A49A92] mt-3">Source: staged action-plan template · risk score {riskReport.score}, {riskReport.level}</p>
        </Card>

        <Card className="p-4">
          <CardTitle icon={<Users className="w-4 h-4" />} iconClass="bg-[#48D597]/15 text-[#48D597]" title="Team View · Optimal Work Split" subtitle="Keep one person on decisions, one on market truth, one on customers" />
          <div className="space-y-3">
            {TEAM_WORKLOAD.map(work => {
              const member = TEAM_MEMBERS.find(m => m.id === work.memberId) ?? TEAM_MEMBERS[0];
              return (
                <div key={work.memberId} className="flex items-center gap-3">
                  <Avatar member={member} size={30} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="font-bold text-[#F6EBDD]">{member.shortName}</span>
                      <span className="text-[#48D597] font-mono-numbers">{work.allocation}%</span>
                    </div>
                    <div className="h-1.5 bg-[#2A211D] rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#D9A35E] to-[#48D597]" style={{ width: `${work.allocation}%` }} />
                    </div>
                    <div className="text-[10px] text-[#A49A92] mt-1">{work.focus}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Regional Map */}
      <Card className="p-4">
        <CardTitle icon={<MapPin className="w-4 h-4" />} iconClass="bg-[#F87171]/15 text-[#F87171]" title="Regional Liquidation State" subtitle="Select a hotspot to inspect the regional signal and response context" />
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
          <div className="h-[250px] rounded-2xl border border-[#2A211D] bg-[#090807] p-2">
            <WorldMap hotspots={REGIONAL_HOTSPOTS} labelled={REGIONAL_HOTSPOTS.filter(h => h.type === 'liquidation').map(h => h.id)} selectedId={selectedHotspot} onSelect={setSelectedHotspot} />
          </div>
          <div className="rounded-2xl bg-[#090807] border border-[#2A211D] p-4 flex flex-col justify-center">
            <div className="mt-section-label">Selected region</div>
            <div className="text-xl font-bold text-[#F6EBDD] mt-1">{hotspot.city}</div>
            <div className="text-sm text-[#D9A35E] font-semibold mt-2">{hotspot.label}</div>
            <div className="text-2xl font-bold text-[#F6EBDD] mt-3 font-mono-numbers">{hotspot.stat}</div>
            <div className="text-xs text-[#A49A92] mt-2 leading-relaxed">
              {hotspot.type === 'liquidation' ? 'Review affected positions and liquidity routing' : hotspot.type === 'tickets' ? 'Assign support triage and customer messaging' : 'Validate sentiment and oracle conditions'}.
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <CardTitle icon={<Radio className="w-4 h-4" />} iconClass="bg-[#D9A35E]/15 text-[#D9A35E]" title="Quick Actions" subtitle="Open the next operational view and record the decision context" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Review alerts',   tab: 'Alerts'       as const, icon: <ShieldAlert className="w-4 h-4" />,      cls: 'border-[#F87171]/25 bg-[#F87171]/8 text-[#F87171] hover:bg-[#F87171]/12' },
            { label: 'Review feed',     tab: 'Live Feeds'   as const, icon: <Radio className="w-4 h-4" />,            cls: 'border-[#D9A35E]/25 bg-[#D9A35E]/8 text-[#D9A35E] hover:bg-[#D9A35E]/12' },
            { label: 'Prepare comms',   tab: 'Communications' as const, icon: <Send className="w-4 h-4" />,           cls: 'border-[#A49A92]/25 bg-[#A49A92]/8 text-[#A49A92] hover:bg-[#A49A92]/12' },
            { label: 'Log decision',    tab: 'Incident Log' as const, icon: <MessageSquareText className="w-4 h-4" />, cls: 'border-[#48D597]/25 bg-[#48D597]/8 text-[#48D597] hover:bg-[#48D597]/12' },
          ].map(q => (
            <button key={q.tab} onClick={() => { addLog(`Quick action: ${q.label}`, 'Ops'); setTab(q.tab); }} className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition-all hover:scale-[1.02] ${q.cls}`}>
              {q.icon} {q.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
