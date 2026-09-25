import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  Clock,
  Droplet,
  Frown,
  Headphones,
  MessageCircle,
  MessageSquareText,
  Plus,
  Send,
  Smile,
  Tag,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Avatar, Card, CardTitle, CategoryBadge, CoinIcon, LiveDot, Sparkline, StepIcon } from '../components/ui';
import { CATEGORY_DOTS, formatElapsed, formatNumber, pctAbove, tooltipStyle } from '../lib';
import WorldMap from '../components/WorldMap';
import { REGIONAL_HOTSPOTS, TEAM_MEMBERS, TOP_LIQUIDATIONS_DATA } from '../mockData';
import { useDashboard } from '../store';

// Baselines used to express live metrics as "% above normal"
const LIQ_BASELINE = 3010;
const TICKET_BASELINE = 328;

function Candles() {
  // Deterministic decorative candlesticks trending sharply down
  const candles = useMemo(() => {
    let price = 30;
    return Array.from({ length: 24 }).map((_, i) => {
      const drop = i > 12 ? 3.2 + Math.sin(i * 1.7) * 1.4 : Math.sin(i * 1.3) * 2.2 - 0.6;
      const open = price;
      const close = price + drop;
      price = close;
      const up = drop < 0;
      return { i, open, close, high: Math.min(open, close) - 1.5 - (i % 3), low: Math.max(open, close) + 1.5 + (i % 4), up };
    });
  }, []);

  return (
    <svg viewBox="0 0 240 110" className="absolute right-0 top-0 h-full w-[58%] animate-candle" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="hero-wave" x1="0" x2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map(i => (
        <path key={i} d={`M0 ${80 + i * 3} C 70 ${60 + i * 6}, 140 ${110 - i * 4}, 240 ${70 + i * 5}`} fill="none" stroke="url(#hero-wave)" strokeWidth={0.8} />
      ))}
      {candles.map(c => {
        const x = 70 + c.i * 7;
        const color = c.up ? '#34d399' : '#ff2a5f';
        return (
          <g key={c.i} opacity={0.4 + (c.i / 24) * 0.6}>
            <line x1={x} x2={x} y1={c.high} y2={c.low} stroke={color} strokeWidth={0.8} />
            <rect x={x - 2.2} y={Math.min(c.open, c.close)} width={4.4} height={Math.max(1.5, Math.abs(c.close - c.open))} fill={color} rx={0.6} />
          </g>
        );
      })}
    </svg>
  );
}

function Hero() {
  const { elapsed } = useDashboard();
  const [h, m, s] = formatElapsed(elapsed);
  return (
    <Card className="p-6 min-h-[200px] bg-linear-to-br from-[#1b1440]/90 via-[#1a1236]/90 to-[#3a0f35]/80 border-purple-500/30">
      <Candles />
      <div className="relative z-10 max-w-[70%]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-rose-500 flex items-center justify-center glow-pink shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl xl:text-[28px] font-extrabold text-white tracking-tight leading-tight">
            Market Flash Crash <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Detected</span>
          </h2>
        </div>
        <p className="text-sm text-slate-300 mt-2 font-medium">High volatility across major pairs. Initiating incident response.</p>
        <div className="mt-6 inline-flex flex-col items-center px-6 py-3 rounded-2xl border border-rose-500/60 bg-rose-500/10 glow-pink">
          <div className="text-3xl font-bold text-white font-mono-numbers tracking-wider">
            {h} : {m} : {s}
          </div>
          <div className="text-xs text-slate-300 font-medium mt-0.5">Since anomaly detected</div>
        </div>
      </div>
    </Card>
  );
}

function CurrentStatus() {
  const { steps, advanceStep, notify } = useDashboard();
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-white">Current Status</h3>
        <button
          onClick={() => {
            advanceStep();
            notify('Incident stage advanced');
          }}
          className="text-[11px] font-semibold text-purple-300 hover:text-white"
        >
          Advance →
        </button>
      </div>
      <div className="space-y-1">
        {steps.map(s => {
          const highlight = s.status === 'In progress' && s.step !== 1;
          return (
            <div
              key={s.step}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg ${highlight ? 'bg-blue-500/15 border border-blue-500/40' : 'border border-transparent'}`}
            >
              <StepIcon step={s} />
              <span className="text-[13px] font-semibold text-slate-100 flex-1">{s.title}</span>
              <span
                className={`text-[11px] font-semibold ${
                  s.status === 'Completed' ? 'text-emerald-400' : s.status === 'In progress' ? (highlight ? 'text-blue-300' : 'text-emerald-400') : 'text-slate-400'
                }`}
              >
                {s.status}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function KpiCards() {
  const { metrics, liqSpark, ticketSpark, sentimentSpark } = useDashboard();
  const [series, setSeries] = useState({ liquidation: true, ticket: true, sentiment: true });

  return (
    <div className="grid grid-cols-1 *:min-w-0 md:grid-cols-[1fr_1fr_1.35fr] gap-4">
      <Card className="p-4 bg-linear-to-br from-[#3a0d25]/90 to-[#1a0f2e]/90 border-rose-500/50 glow-pink">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/25 flex items-center justify-center">
            <Droplet className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[15px] font-bold text-white">
            Liquidations <span className="text-xs text-slate-400 font-medium">(1m)</span>
          </span>
        </div>
        <div className="flex items-baseline gap-3 mt-3">
          <span className="text-3xl font-extrabold text-rose-300 font-mono-numbers">{formatNumber(metrics.liquidations)}</span>
          <span className="text-sm font-bold text-rose-400">{pctAbove(metrics.liquidations, LIQ_BASELINE)}</span>
        </div>
        <div className="-mx-4 -mb-4 mt-1">
          <Sparkline data={liqSpark} color="#ff2a5f" id="spark-liq" height={64} />
        </div>
      </Card>

      <Card className="p-4 bg-linear-to-br from-[#33230d]/90 to-[#1a1428]/90 border-amber-500/50 glow-amber">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/25 flex items-center justify-center">
            <MessageSquareText className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[15px] font-bold text-white">
            Support Tickets <span className="text-xs text-slate-400 font-medium">(1m)</span>
          </span>
        </div>
        <div className="flex items-baseline gap-3 mt-3">
          <span className="text-3xl font-extrabold text-amber-300 font-mono-numbers">{formatNumber(metrics.tickets)}</span>
          <span className="text-sm font-bold text-amber-400">{pctAbove(metrics.tickets, TICKET_BASELINE)}</span>
        </div>
        <div className="-mx-4 -mb-4 mt-1">
          <Sparkline data={ticketSpark} color="#fbbf24" id="spark-ticket" height={64} />
        </div>
      </Card>

      <Card className="p-4 bg-linear-to-br from-[#231545]/90 to-[#15122e]/90 border-purple-500/50 glow-purple">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/25 flex items-center justify-center">
            <Zap className="w-4 h-4 text-purple-300" />
          </div>
          <span className="text-[15px] font-bold text-white">Social Sentiment</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {(
            [
              ['liquidation', 'Liquidation', <Droplet key="l" className="w-3 h-3 text-rose-400" />],
              ['ticket', 'Ticket', <Tag key="t" className="w-3 h-3 text-emerald-400" />],
              ['sentiment', 'Sentiment', <Smile key="s" className="w-3 h-3 text-amber-400" />],
            ] as const
          ).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setSeries(s => ({ ...s, [key]: !s[key] }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                series[key] ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-slate-500'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        <div className="-mx-4 -mb-4 mt-2 h-[70px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentSpark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spark-sent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={[-110, 120]} />
              {series.liquidation && <Area type="monotone" dataKey="liquidation" stroke="#ff2a5f" strokeWidth={1.5} fill="none" isAnimationActive={false} />}
              {series.ticket && <Area type="monotone" dataKey="ticket" stroke="#34d399" strokeWidth={1.5} fill="none" isAnimationActive={false} />}
              {series.sentiment && (
                <Area type="monotone" dataKey="sentiment" stroke="#a855f7" strokeWidth={2} fill="url(#spark-sent)" isAnimationActive={false} style={{ filter: 'drop-shadow(0 0 6px #a855f7)' }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute top-4 right-4 text-right">
          <div className="text-lg font-extrabold text-purple-300 font-mono-numbers">{metrics.sentiment}%</div>
        </div>
      </Card>
    </div>
  );
}

function MarketOverview() {
  const { metrics, btcSeries } = useDashboard();
  const first = btcSeries[0].price;
  const change = ((metrics.btcPrice - 67130) / 67130) * 100;
  const last = btcSeries[btcSeries.length - 1];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-[1fr_1.35fr] gap-4">
        <div className="flex flex-col min-h-[280px]">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-[15px] font-bold text-white">Live Market Overview</h3>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <LiveDot /> Live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CoinIcon coin="btc" size={34} />
            <div>
              <div className="text-xs font-semibold text-slate-300">BTC/USDT</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white font-mono-numbers">
                  {metrics.btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-bold ${change < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {change < 0 ? '' : '+'}
                  {change.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 mt-3 min-h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={btcSeries} margin={{ top: 24, right: 12, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="btc-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff2a5f" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#ff2a5f" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={4} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[Math.min(60000, Math.floor((first - 7000) / 2000) * 2000), 68000]}
                  ticks={[60000, 62000, 64000, 66000, 68000]}
                  tickFormatter={v => v.toLocaleString('en-US')}
                  width={54}
                />
                <Tooltip {...tooltipStyle} formatter={v => [`$${Number(v).toLocaleString('en-US')}`, 'Price']} />
                <Area type="linear" dataKey="price" stroke="#ff2a5f" strokeWidth={1.8} fill="url(#btc-fill)" isAnimationActive={false} style={{ filter: 'drop-shadow(0 0 5px #ff2a5f)' }} />
                <ReferenceDot
                  x={last.time}
                  y={last.price}
                  r={4}
                  fill="#ff2a5f"
                  stroke="#fff"
                  strokeWidth={1.5}
                  label={{ value: 'Flash crash detected', position: 'left', fill: '#fecdd3', fontSize: 10, fontWeight: 600, offset: 10 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex items-center">
          <WorldMap hotspots={REGIONAL_HOTSPOTS} labelled={['h-ny', 'h-london', 'h-tokyo']} />
        </div>
      </div>
    </Card>
  );
}

function RightColumn() {
  const { metrics, setTab } = useDashboard();
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 bg-linear-to-br from-[#4a0d24]/95 to-[#2a0c26]/95 border-rose-500/60 glow-pink">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shrink-0 glow-pink">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-white">Key Alert</div>
            <div className="text-sm font-semibold text-rose-200">Abnormal Liquidations Detected</div>
            <div className="text-xs text-slate-300 mt-1.5">
              Liquidations (1m): <span className="text-rose-300 font-bold">{formatNumber(metrics.liquidations)}</span>{' '}
              <span className="text-rose-400 font-bold">({pctAbove(metrics.liquidations, LIQ_BASELINE)})</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setTab('Alerts')}
          className="mt-3 w-full py-2 rounded-lg bg-linear-to-r from-rose-600 to-pink-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 glow-pink"
        >
          View Details <ArrowRight className="w-4 h-4" />
        </button>
      </Card>

      <Card className="p-3.5 border-amber-500/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2">
              <span className="text-[13px] font-bold text-white">Support Ticket Surge</span>
              <span className="text-[11px] text-slate-400 shrink-0">10:38 AM</span>
            </div>
            <div className="text-lg font-extrabold text-amber-300 font-mono-numbers">
              {formatNumber(metrics.tickets)} <span className="text-sm text-amber-400">({pctAbove(metrics.tickets, TICKET_BASELINE)})</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-3.5 border-purple-500/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center shrink-0">
            <Frown className="w-5 h-5 text-purple-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2">
              <span className="text-[13px] font-bold text-white">Sentiment Turned Negative</span>
              <span className="text-[11px] text-slate-400 shrink-0">10:34 AM</span>
            </div>
            <div className="text-lg font-extrabold text-purple-300 font-mono-numbers">
              {metrics.sentiment}% <span className="text-sm text-purple-400">(negative)</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 flex-1">
        <CardTitle
          icon={<Droplet className="w-4 h-4" />}
          iconClass="bg-rose-500/20 text-rose-400"
          title="Top Liquidations"
          right={
            <button onClick={() => setTab('Live Feeds')} className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-[11px] font-semibold text-slate-400 px-1 pb-2 border-b border-white/5">
          <span>Pair</span>
          <span className="text-right">Amount</span>
          <span className="text-right w-12">Δ</span>
        </div>
        {TOP_LIQUIDATIONS_DATA.map(r => (
          <div key={r.pair} className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center px-1 py-3 border-b border-white/5 last:border-0">
            <span className="flex items-center gap-2.5 text-[13px] font-semibold text-white">
              <CoinIcon coin={r.iconType} size={26} /> {r.pair}
            </span>
            <span className="text-[13px] font-semibold text-slate-200 font-mono-numbers text-right">{r.amount}</span>
            <span className="text-[13px] font-bold text-rose-400 text-right w-12">{r.delta}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function IncidentLogCard() {
  const { logs, addLog, setTab } = useDashboard();
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState('');

  const submit = () => {
    if (!note.trim()) return;
    addLog(note.trim(), 'Ops', 'You (Team Lead)', 'pending');
    setNote('');
    setAdding(false);
  };

  return (
    <Card className="p-4">
      <CardTitle
        icon={<ClipboardList className="w-4 h-4" />}
        iconClass="bg-pink-500/20 text-pink-400"
        title={
          <span className="flex items-center gap-2">
            Incident Log
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <LiveDot /> Auto-save
            </span>
          </span>
        }
        right={
          <button
            onClick={() => setAdding(a => !a)}
            className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg border border-purple-400/50 bg-purple-500/15 hover:bg-purple-500/25"
          >
            <Plus className="w-3.5 h-3.5" /> Add Note
          </button>
        }
      />
      {adding && (
        <div className="flex gap-2 mb-3">
          <input
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="What did you just do or observe?"
            className="flex-1 bg-[#0c0f1e] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
          />
          <button onClick={submit} className="px-3 rounded-lg bg-purple-600 text-white text-xs font-bold">
            Save
          </button>
        </div>
      )}
      <div className="relative">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10" />
        {logs.slice(-5).map(l => (
          <div key={l.id} className="relative flex items-center gap-3 py-2">
            <span className={`w-[11px] h-[11px] rounded-full shrink-0 z-10 ${CATEGORY_DOTS[l.category]}`} />
            <span className="text-xs text-slate-400 font-mono-numbers w-10 shrink-0">{l.time}</span>
            <span className="text-[13px] text-slate-100 font-medium flex-1 truncate">{l.text}</span>
            <CategoryBadge category={l.category} />
            {l.status === 'done' ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Clock className="w-4 h-4 text-slate-400 shrink-0" />}
          </div>
        ))}
      </div>
      <button onClick={() => setTab('Incident Log')} className="mt-2 text-xs font-semibold text-purple-300 hover:text-white">
        Open full log →
      </button>
    </Card>
  );
}

function QuickActions() {
  const { setTab, addLog, notify } = useDashboard();
  const actions = [
    {
      label: 'Send Comm',
      sub: '(Pre-built Template)',
      icon: <Send className="w-5 h-5" />,
      cls: 'from-pink-500 to-fuchsia-600 glow-pink',
      run: () => setTab('Communications'),
    },
    {
      label: 'View Tickets',
      icon: <Headphones className="w-5 h-5" />,
      cls: 'from-blue-500 to-indigo-600 glow-cyan',
      run: () => {
        addLog('Reviewed support ticket queue', 'Support');
        notify('Ticket queue opened in Live Feeds', 'info');
        setTab('Live Feeds');
      },
    },
    {
      label: 'Open Incident Log',
      icon: <ClipboardList className="w-5 h-5" />,
      cls: 'from-emerald-500 to-teal-600 glow-emerald',
      run: () => setTab('Incident Log'),
    },
    {
      label: 'Check Positions',
      icon: <BarChart3 className="w-5 h-5" />,
      cls: 'from-purple-500 to-violet-600 glow-purple',
      run: () => {
        addLog('Checked open positions & funding rates', 'Ops');
        notify('Position check logged');
      },
    },
  ];

  return (
    <Card className="p-4">
      <CardTitle icon={<Zap className="w-4 h-4" />} iconClass="bg-rose-500/20 text-rose-400" title="Quick Actions" />
      <div className="grid grid-cols-2 gap-3">
        {actions.map(a => (
          <button
            key={a.label}
            onClick={a.run}
            className={`bg-linear-to-br ${a.cls} rounded-xl py-4 px-2 flex flex-col items-center justify-center gap-1.5 text-white hover:brightness-110 hover:-translate-y-0.5 transition-all`}
          >
            {a.icon}
            <span className="text-[13px] font-bold leading-tight">{a.label}</span>
            {a.sub && <span className="text-[10px] font-medium opacity-80 -mt-1">{a.sub}</span>}
          </button>
        ))}
      </div>
    </Card>
  );
}

function TeamView() {
  const [selected, setSelected] = useState('m3');
  const [messages, setMessages] = useState([{ from: 'Arjun', text: 'Support tickets are still rising. Monitoring closely.', time: '10:49 AM' }]);
  const [draft, setDraft] = useState('');
  const latest = messages[messages.length - 1];

  const send = () => {
    if (!draft.trim()) return;
    setMessages(m => [...m, { from: 'You', text: draft.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]);
    setDraft('');
  };

  return (
    <Card className="p-4">
      <CardTitle
        icon={<MessageCircle className="w-4 h-4" />}
        iconClass="bg-blue-500/20 text-blue-400"
        title="Team View"
        right={
          <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            {TEAM_MEMBERS.length}/{TEAM_MEMBERS.length} Online
          </span>
        }
      />
      <div className="grid grid-cols-3 gap-2">
        {TEAM_MEMBERS.map(m => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl text-left transition-colors ${
              selected === m.id ? 'bg-white/10 border border-white/25' : 'border border-transparent hover:bg-white/5'
            }`}
          >
            <Avatar member={m} size={36} />
            <div className="min-w-0 text-center sm:text-left">
              <div className="text-[13px] font-bold text-white truncate">{m.shortName}</div>
              <div className="text-[10px] text-slate-400 truncate">{m.name.match(/\((.*)\)/)?.[1]}</div>
              <div className={`text-[10px] font-semibold flex items-center gap-1 ${m.status === 'Active' ? 'text-emerald-300' : 'text-emerald-400'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {m.status}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-[#0c0f1e]/80 border border-white/10 p-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
          <MessageSquareText className="w-3.5 h-3.5 text-blue-300" />
        </div>
        <p className="text-xs text-slate-200 flex-1 min-w-0">
          <span className="font-bold">{latest.from}:</span> {latest.text}
        </p>
        <span className="text-[10px] text-slate-500 shrink-0">{latest.time}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Message the ops team…"
          className="flex-1 min-w-0 bg-[#0c0f1e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
        />
        <button onClick={send} className="px-2.5 rounded-lg bg-blue-600 text-white" aria-label="Send message">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}

export default function Overview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 *:min-w-0 lg:grid-cols-[1fr_260px] gap-4">
            <Hero />
            <CurrentStatus />
          </div>
          <KpiCards />
          <MarketOverview />
        </div>
        <RightColumn />
      </div>
      <div className="grid grid-cols-1 *:min-w-0 lg:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1.1fr] gap-4">
        <IncidentLogCard />
        <QuickActions />
        <TeamView />
      </div>
    </div>
  );
}
