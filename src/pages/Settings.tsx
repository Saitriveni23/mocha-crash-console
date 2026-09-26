import { Bell, Brain, Gauge, Globe, Mail, MessageSquare, Radio, Send, SlidersHorizontal, Smartphone, Users, Webhook, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar, Card, CardTitle, PageHeader, Toggle } from '../components/ui';
import { TEAM_MEMBERS } from '../mockData';
import { useDashboard, type Settings as SettingsState } from '../store';

function Row({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-[#2A211D] last:border-0">
      <div>
        <div className="text-sm font-semibold text-[#F6EBDD]">{title}</div>
        <div className="text-xs text-[#A49A92] mt-0.5">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="py-3">
      <div className="flex justify-between text-sm mb-3">
        <span className="font-semibold text-[#F6EBDD]">{label}</span>
        <span className="font-mono-numbers font-bold text-[#D9A35E]">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="mt-range"
        style={{ ['--fill' as string]: `${fill}%` }}
      />
      <div className="flex justify-between text-[10px] text-[#A49A92] mt-1.5 font-mono-numbers">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

const CHANNEL_ICONS: Record<string, ReactNode> = {
  Email:    <Mail       className="w-4 h-4" />,
  Slack:    <MessageSquare className="w-4 h-4" />,
  SMS:      <Smartphone className="w-4 h-4" />,
  Webhook:  <Webhook    className="w-4 h-4" />,
  Discord:  <Zap        className="w-4 h-4" />,
  Telegram: <Send       className="w-4 h-4" />,
};

export default function Settings() {
  const { settings, setSettings } = useDashboard();
  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Tune the simulation, alert thresholds and notification routing — changes apply instantly" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Simulation */}
        <Card className="p-5">
          <CardTitle icon={<Radio className="w-4 h-4" />} iconClass="bg-[#D9A35E]/15 text-[#D9A35E]" title="Live Simulation" subtitle="Controls the streaming market data" />
          <Row title="Stream live data" desc="Update prices, liquidations and the trade feed in real time">
            <Toggle on={settings.live} onChange={v => set('live', v)} />
          </Row>
          <Slider label="Update interval" value={settings.speedMs} min={1000} max={6000} step={500} format={v => `${(v / 1000).toFixed(1)}s`} onChange={v => set('speedMs', v)} />
        </Card>

        {/* Alert Thresholds */}
        <Card className="p-5">
          <CardTitle icon={<Gauge className="w-4 h-4" />} iconClass="bg-[#F87171]/15 text-[#F87171]" title="Alert Thresholds" subtitle="When a rule starts firing" />
          <Slider label="Liquidations per minute" value={settings.liquidationThreshold} min={1000} max={20000} step={500} format={v => v.toLocaleString('en-US')} onChange={v => set('liquidationThreshold', v)} />
          <Slider label="Support tickets per minute" value={settings.ticketThreshold} min={100} max={2000} step={50} format={v => v.toLocaleString('en-US')} onChange={v => set('ticketThreshold', v)} />
          <Slider label="Net sentiment floor" value={settings.sentimentThreshold} min={-100} max={0} step={5} format={v => `${v}%`} onChange={v => set('sentimentThreshold', v)} />
        </Card>

        {/* Notification Channels */}
        <Card className="p-5">
          <CardTitle icon={<Bell className="w-4 h-4" />} iconClass="bg-[#48D597]/15 text-[#48D597]" title="Notification Center" subtitle="Where customer broadcasts can go" />
          <div className="space-y-1">
            {Object.entries(settings.channels).map(([name, on]) => (
              <div key={name} className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${on ? 'border-[#D9A35E]/25 bg-[#D9A35E]/5' : 'border-[#2A211D] bg-[#090807]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${on ? 'bg-[#D9A35E]/15 text-[#D9A35E]' : 'bg-[#2A211D] text-[#A49A92]'}`}>
                    {CHANNEL_ICONS[name] ?? <Globe className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#F6EBDD]">{name}</div>
                    <div className="text-xs text-[#A49A92]">{on ? 'Active in Communications' : 'Hidden from Communications'}</div>
                  </div>
                </div>
                <Toggle on={on} onChange={v => set('channels', { ...settings.channels, [name]: v })} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          {/* AI Models */}
          <Card className="p-5">
            <CardTitle icon={<Brain className="w-4 h-4" />} iconClass="bg-[#D9A35E]/15 text-[#D9A35E]" title="AI Oracle Models" subtitle="AI engines powering the decision loop" />
            {[
              { name: 'GPT-4o', status: 'Active', latency: '128ms', cost: '$0.002/req' },
              { name: 'Gemini 1.5', status: 'Standby', latency: '210ms', cost: '$0.001/req' },
              { name: 'Claude 3.5', status: 'Standby', latency: '180ms', cost: '$0.003/req' },
            ].map(model => (
              <div key={model.name} className="flex items-center justify-between py-3 border-b border-[#2A211D] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${model.status === 'Active' ? 'bg-[#48D597]' : 'bg-[#A49A92]'}`} />
                  <span className="text-sm font-semibold text-[#F6EBDD]">{model.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#A49A92]">
                  <span className="font-mono-numbers">{model.latency}</span>
                  <span>{model.cost}</span>
                  <span className={`font-bold ${model.status === 'Active' ? 'text-[#48D597]' : 'text-[#A49A92]'}`}>{model.status}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* Preferences */}
          <Card className="p-5">
            <CardTitle icon={<SlidersHorizontal className="w-4 h-4" />} iconClass="bg-[#A49A92]/15 text-[#A49A92]" title="Preferences" />
            <Row title="Compact tables" desc="Tighter row spacing in the live trade feed">
              <Toggle on={settings.compactMode} onChange={v => set('compactMode', v)} />
            </Row>
          </Card>

          {/* Team */}
          <Card className="p-5">
            <CardTitle icon={<Users className="w-4 h-4" />} iconClass="bg-[#48D597]/15 text-[#48D597]" title="Ops Team" subtitle="Members on this incident" />
            <div className="space-y-2">
              {TEAM_MEMBERS.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#090807] border border-[#2A211D] hover:border-[#D9A35E]/20 transition-colors">
                  <Avatar member={m} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#F6EBDD] truncate">{m.name}</div>
                    <div className="text-xs text-[#A49A92] truncate">{m.role}</div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${m.status === 'Online' ? 'text-[#48D597]' : m.status === 'Active' ? 'text-[#D9A35E]' : 'text-[#A49A92]'}`}>
                    <span className={`w-2 h-2 rounded-full ${m.status === 'Online' ? 'bg-[#48D597]' : m.status === 'Active' ? 'bg-[#D9A35E]' : 'bg-[#A49A92]'}`} />
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
