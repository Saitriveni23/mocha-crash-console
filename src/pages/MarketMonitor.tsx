import { AlertCircle, AlertTriangle, ArrowDownRight, BellRing, CheckCircle2, Eye, RotateCcw, Shield, Target } from 'lucide-react';
import { useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardTitle, LiveDot, PageHeader, Pill, StepIcon } from '../components/ui';
import { formatNumber, tooltipStyle } from '../lib';
import { TCS_REFERENCE, TCS_WARNING_BAND, useDashboard } from '../store';

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function MarketMonitor() {
  const { tcs, tcsThreshold, setTcsThreshold, userAlerts, dismissUserAlert, resetTcs, metrics, settings, steps, notify } = useDashboard();
  const [draft, setDraft] = useState(String(tcsThreshold));
  const [highlight, setHighlight] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const change = ((tcs.price - TCS_REFERENCE) / TCS_REFERENCE) * 100;
  const status = tcs.price < tcsThreshold ? 'Triggered' : tcs.price <= tcsThreshold + TCS_WARNING_BAND ? 'Near' : 'Active';

  const saveThreshold = () => {
    const v = Math.round(Number(draft));
    if (!Number.isFinite(v) || v <= 0) {
      setDraft(String(tcsThreshold));
      return;
    }
    setTcsThreshold(v);
    notify(`TCS alert set at ${rupees(v)}`);
  };

  const viewMarketData = () => {
    chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlight(true);
    setTimeout(() => setHighlight(false), 1500);
  };

  // Layer 2: platform-wide anomaly signals, judged against the Settings thresholds
  const anomalies = [
    { label: 'Liquidations spiking', value: formatNumber(metrics.liquidations), bad: metrics.liquidations > settings.liquidationThreshold },
    { label: 'Support queue spiking', value: formatNumber(metrics.tickets), bad: metrics.tickets > settings.ticketThreshold },
    { label: 'Negative social sentiment', value: `${metrics.sentiment}%`, bad: metrics.sentiment < settings.sentimentThreshold },
  ];

  const minPrice = Math.min(...tcs.history.map(h => h.price), tcsThreshold);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Market Monitor"
        subtitle="Layer 1 personal price alerts, shown alongside Layer 2 platform incident monitoring"
        right={
          <button onClick={resetTcs} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white hover:bg-white/10">
            <RotateCcw className="w-4 h-4" /> Reset simulation
          </button>
        }
      />

      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-[360px_1fr] gap-4">
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selected asset</span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <LiveDot /> {settings.live ? 'Live' : 'Paused'}
            </span>
          </div>
          <div className="flex items-start justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm">TCS</div>
              <div>
                <div className="text-xl font-extrabold text-white">TCS</div>
                <div className="text-xs text-slate-400">Tata Consultancy Services</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-white font-mono-numbers">{rupees(tcs.price)}</div>
              <div className={`text-sm font-bold flex items-center justify-end gap-0.5 ${change < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {change < 0 && <ArrowDownRight className="w-4 h-4" />}
                {change.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Trading volume</span>
              <span className="font-bold text-white font-mono-numbers">{tcs.volume.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reference price</span>
              <span className="font-bold text-white font-mono-numbers">{rupees(TCS_REFERENCE)}</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your alert rule</div>
            <div
              className={`rounded-xl border p-3.5 ${
                status === 'Triggered' ? 'border-rose-500/60 bg-rose-500/10 glow-pink' : status === 'Near' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Alert me when TCS falls below</span>
                <Pill
                  className={
                    status === 'Triggered' ? 'border-rose-500/50 text-rose-300' : status === 'Near' ? 'border-amber-500/50 text-amber-300' : 'border-emerald-500/40 text-emerald-300'
                  }
                >
                  {status}
                </Pill>
              </div>
              <div className="flex gap-2 mt-2.5">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveThreshold()}
                    aria-label="Alert threshold in rupees"
                    className="w-full bg-[#0c0f1e] border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-sm font-bold text-white font-mono-numbers focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  onClick={saveThreshold}
                  disabled={Number(draft) === tcsThreshold}
                  className="px-3 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-bold disabled:opacity-40"
                >
                  Set
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Warns within {rupees(TCS_WARNING_BAND)} of the limit, then again once it's crossed.</p>
            </div>
          </div>

          <p className="mt-auto pt-5 text-[11px] text-slate-500 leading-relaxed">
            No autonomous execution: alerts inform you and suggest next steps. Nothing is bought or sold automatically.
          </p>
        </Card>

        <div className="space-y-4">
          <div ref={chartRef}>
            <Card className={`p-5 transition-shadow ${highlight ? 'glow-purple border-purple-400/60' : ''}`}>
              <CardTitle icon={<Target className="w-4 h-4" />} iconClass="bg-blue-500/20 text-blue-300" title="TCS Price" subtitle="Dashed line is your alert threshold" />
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tcs.history} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tcs-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                    <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      domain={[Math.floor((minPrice - 40) / 50) * 50, TCS_REFERENCE + 30]}
                      tickFormatter={v => `₹${Number(v).toLocaleString('en-IN')}`}
                    />
                    <Tooltip {...tooltipStyle} formatter={v => [rupees(Number(v)), 'Price']} />
                    <ReferenceLine
                      y={tcsThreshold}
                      stroke="#ff2a5f"
                      strokeDasharray="5 4"
                      label={{ value: `Alert ${rupees(tcsThreshold)}`, position: 'insideBottomRight', fill: '#fda4af', fontSize: 10, fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#tcs-fill)" isAnimationActive={false} style={{ filter: 'drop-shadow(0 0 5px #3b82f6)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <CardTitle
              icon={<BellRing className="w-4 h-4" />}
              title="Your Alerts"
              subtitle="Layer 1: individual user protection"
              right={userAlerts.length > 0 && <Pill className="border-rose-500/40 text-rose-300">{userAlerts.length} active</Pill>}
            />
            {userAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-white/15 text-sm text-slate-400">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-2" />
                No active alerts. Watching your threshold.
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                {userAlerts.map(a => (
                  <div
                    key={a.id}
                    className={`rounded-xl border p-4 animate-fade-up ${a.type === 'CRITICAL' ? 'border-rose-500/60 bg-rose-500/10' : 'border-amber-500/50 bg-amber-500/10'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`flex items-center gap-2 text-sm font-bold ${a.type === 'CRITICAL' ? 'text-rose-300' : 'text-amber-300'}`}>
                        {a.type === 'CRITICAL' ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {a.type === 'CRITICAL' ? 'Price alert triggered' : 'Approaching threshold'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono-numbers">{a.time}</span>
                    </div>
                    <p className="text-sm text-slate-100 mt-1.5">{a.message}</p>
                    <div className="flex gap-4 text-xs font-semibold text-slate-300 mt-2">
                      <span>Price: {rupees(a.price)}</span>
                      <span>Threshold: {rupees(a.threshold)}</span>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                      <button onClick={viewMarketData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white">
                        <Eye className="w-3.5 h-3.5" /> View market data
                      </button>
                      <button onClick={() => dismissUserAlert(a.id)} className="px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/5 text-xs font-bold text-slate-300">
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <CardTitle icon={<Shield className="w-4 h-4" />} iconClass="bg-purple-500/20 text-purple-300" title="Platform Incident Context" subtitle="Layer 2: what the ops team is seeing" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System anomaly detection</div>
                {anomalies.map(x => (
                  <div key={x.label} className="flex items-center gap-2.5 text-sm">
                    {x.bad ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <span className={x.bad ? 'text-rose-200' : 'text-slate-300'}>{x.label}</span>
                    <span className="ml-auto font-bold text-white font-mono-numbers">{x.value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ops incident response</div>
                {steps.map(s => (
                  <div key={s.step} className="flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-lg bg-white/[0.03]">
                    <StepIcon step={s} />
                    <span className="text-white font-semibold flex-1">{s.title}</span>
                    <span className="text-[11px] text-slate-400">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
