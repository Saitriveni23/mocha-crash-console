import { Bell, Gauge, Radio, SlidersHorizontal, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar, Card, CardTitle, PageHeader, Toggle } from '../components/ui';
import { TEAM_MEMBERS } from '../mockData';
import { useDashboard, type Settings as SettingsState } from '../store';

function Row({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="py-3">
      <div className="flex justify-between text-sm mb-2.5">
        <span className="font-semibold text-white">{label}</span>
        <span className="font-mono-numbers font-bold text-pink-300">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="neon-range w-full"
        style={{ ['--fill' as string]: `${fill}%` }}
      />
      <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono-numbers">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export default function Settings() {
  const { settings, setSettings } = useDashboard();
  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        subtitle="Tune the simulation, alert thresholds and notification routing — changes apply instantly"
      />

      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-2 gap-4">
        <Card className="p-5">
          <CardTitle icon={<Radio className="w-4 h-4" />} title="Live Simulation" subtitle="Controls the streaming market data" />
          <Row title="Stream live data" desc="Update prices, liquidations and the trade feed in real time">
            <Toggle on={settings.live} onChange={v => set('live', v)} />
          </Row>
          <Slider
            label="Update interval"
            value={settings.speedMs}
            min={1000}
            max={6000}
            step={500}
            format={v => `${(v / 1000).toFixed(1)}s`}
            onChange={v => set('speedMs', v)}
          />
        </Card>

        <Card className="p-5">
          <CardTitle icon={<Gauge className="w-4 h-4" />} iconClass="bg-amber-500/20 text-amber-300" title="Alert Thresholds" subtitle="When a rule starts firing" />
          <Slider
            label="Liquidations per minute"
            value={settings.liquidationThreshold}
            min={1000}
            max={20000}
            step={500}
            format={v => v.toLocaleString('en-US')}
            onChange={v => set('liquidationThreshold', v)}
          />
          <Slider
            label="Support tickets per minute"
            value={settings.ticketThreshold}
            min={100}
            max={2000}
            step={50}
            format={v => v.toLocaleString('en-US')}
            onChange={v => set('ticketThreshold', v)}
          />
          <Slider
            label="Net sentiment floor"
            value={settings.sentimentThreshold}
            min={-100}
            max={0}
            step={5}
            format={v => `${v}%`}
            onChange={v => set('sentimentThreshold', v)}
          />
        </Card>

        <Card className="p-5">
          <CardTitle icon={<Bell className="w-4 h-4" />} iconClass="bg-blue-500/20 text-blue-300" title="Notification Channels" subtitle="Where customer broadcasts can go" />
          {Object.entries(settings.channels).map(([name, on]) => (
            <Row key={name} title={name} desc={on ? 'Offered in Communications' : 'Hidden from Communications'}>
              <Toggle on={on} onChange={v => set('channels', { ...settings.channels, [name]: v })} />
            </Row>
          ))}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <CardTitle icon={<SlidersHorizontal className="w-4 h-4" />} iconClass="bg-purple-500/20 text-purple-300" title="Preferences" />
            <Row title="Compact tables" desc="Tighter row spacing in the live trade feed">
              <Toggle on={settings.compactMode} onChange={v => set('compactMode', v)} />
            </Row>
          </Card>

          <Card className="p-5">
            <CardTitle icon={<Users className="w-4 h-4" />} iconClass="bg-emerald-500/20 text-emerald-300" title="Ops Team" subtitle="Members on this incident" />
            <div className="space-y-2">
              {TEAM_MEMBERS.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <Avatar member={m} size={38} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{m.name}</div>
                    <div className="text-xs text-slate-400 truncate">{m.role}</div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> {m.status}
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
