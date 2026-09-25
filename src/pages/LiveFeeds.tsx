import { Activity, Globe2, MapPin, Pause, Play, Radio, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardTitle, CoinIcon, LiveDot, PageHeader, Pill } from '../components/ui';
import { tooltipStyle } from '../lib';
import WorldMap from '../components/WorldMap';
import { MARKET_PAIRS, REGIONAL_HOTSPOTS, TOP_LIQUIDATIONS_DATA } from '../mockData';
import { useDashboard } from '../store';
import type { LiveTradeFeedItem } from '../types';

const TYPE_STYLE: Record<LiveTradeFeedItem['type'], string> = {
  LIQUIDATION: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  SELL: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  BUY: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
};

const fmtPrice = (p: number) => p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: p < 10 ? 4 : 2 });

function Ticker() {
  const { metrics } = useDashboard();
  const pairs = MARKET_PAIRS.map(p => (p.coin === 'btc' ? { ...p, price: metrics.btcPrice } : p));
  return (
    <Card className="py-2.5 overflow-hidden">
      <div className="flex w-max animate-marquee">
        {[...pairs, ...pairs].map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 px-6 border-r border-white/5">
            <CoinIcon coin={p.coin} size={20} />
            <span className="text-xs font-bold text-white">{p.symbol}</span>
            <span className="text-xs font-semibold text-slate-200 font-mono-numbers">${fmtPrice(p.price)}</span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${p.changePercent < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {p.changePercent < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {p.changePercent}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PriceChart() {
  const { btcSeries, metrics } = useDashboard();
  const [coin, setCoin] = useState(MARKET_PAIRS[0].coin);
  const pair = MARKET_PAIRS.find(p => p.coin === coin)!;
  const ratio = pair.price / 61482.32;
  const data = btcSeries.map(d => ({ ...d, price: +(d.price * ratio).toFixed(pair.price < 10 ? 4 : 2) }));
  const price = coin === 'btc' ? metrics.btcPrice : pair.price;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CoinIcon coin={pair.coin} size={40} />
          <div>
            <div className="text-sm font-semibold text-slate-300">{pair.symbol}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white font-mono-numbers">${fmtPrice(price)}</span>
              <span className="text-sm font-bold text-rose-400">{pair.changePercent}%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl bg-[#0c0f1e]/80 border border-white/10">
          {MARKET_PAIRS.map(p => (
            <button
              key={p.coin}
              onClick={() => setCoin(p.coin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                coin === p.coin ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.symbol.split('/')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          ['24h High', `$${fmtPrice(pair.high24h)}`, 'text-emerald-300'],
          ['24h Low', `$${fmtPrice(pair.low24h)}`, 'text-rose-300'],
          ['24h Volume', `$${pair.volume24h}`, 'text-white'],
        ].map(([label, value, cls]) => (
          <div key={label} className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2">
            <div className="text-[11px] text-slate-400 font-semibold">{label}</div>
            <div className={`text-sm font-bold font-mono-numbers ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="feed-price" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff2a5f" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ff2a5f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} interval={3} />
            <YAxis yAxisId="p" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={64} tickFormatter={v => Number(v).toLocaleString('en-US')} />
            <YAxis yAxisId="v" orientation="right" hide domain={[0, (max: number) => max * 3]} />
            <Tooltip {...tooltipStyle} />
            <Bar yAxisId="v" dataKey="volume" name="Volume" fill="#8b5cf6" fillOpacity={0.35} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Area yAxisId="p" type="monotone" dataKey="price" name="Price" stroke="#ff2a5f" strokeWidth={2} fill="url(#feed-price)" isAnimationActive={false} style={{ filter: 'drop-shadow(0 0 5px #ff2a5f)' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function TradeStream() {
  const { feed, settings, setSettings } = useDashboard();
  const cell = settings.compactMode ? 'py-1.5' : 'py-2.5';
  const [filter, setFilter] = useState<'ALL' | LiveTradeFeedItem['type']>('ALL');
  const rows = feed.filter(f => filter === 'ALL' || f.type === filter).slice(0, 14);

  return (
    <Card className="p-5">
      <CardTitle
        icon={<Radio className="w-4 h-4" />}
        title={
          <span className="flex items-center gap-2">
            Live Trade Stream {settings.live && <LiveDot color="bg-rose-400" />}
          </span>
        }
        subtitle="Liquidations and large orders across all venues"
        right={
          <button
            onClick={() => setSettings(s => ({ ...s, live: !s.live }))}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
          >
            {settings.live ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {settings.live ? 'Pause' : 'Resume'}
          </button>
        }
      />
      <div className="flex gap-2 mb-3">
        {(['ALL', 'LIQUIDATION', 'SELL', 'BUY'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-colors ${
              filter === f ? 'bg-purple-500/25 border-purple-400/60 text-white' : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-[13px] min-w-[640px]">
          <thead>
            <tr className="text-[11px] text-slate-400 text-left border-b border-white/5">
              <th className="font-semibold py-2 pr-3">Time</th>
              <th className="font-semibold py-2 pr-3">Pair</th>
              <th className="font-semibold py-2 pr-3">Type</th>
              <th className="font-semibold py-2 pr-3 text-right">Amount</th>
              <th className="font-semibold py-2 pr-3 text-right">Price</th>
              <th className="font-semibold py-2 pr-3 text-right">Value</th>
              <th className="font-semibold py-2">Hub</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-white/5 last:border-0 animate-row-flash">
                <td className={`${cell} pr-3 text-slate-400 font-mono-numbers text-xs`}>{r.time}</td>
                <td className={`${cell} pr-3 font-semibold text-white`}>{r.pair}</td>
                <td className={`${cell} pr-3`}>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_STYLE[r.type]}`}>{r.type}</span>
                </td>
                <td className={`${cell} pr-3 text-right font-mono-numbers text-slate-200`}>{r.amount}</td>
                <td className={`${cell} pr-3 text-right font-mono-numbers text-slate-200`}>{r.price}</td>
                <td className={`${cell} pr-3 text-right font-mono-numbers font-bold ${r.type === 'BUY' ? 'text-emerald-300' : 'text-rose-300'}`}>{r.value}</td>
                <td className={`${cell} text-slate-300 text-xs`}>{r.sourceHub}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Hotspots() {
  const [selectedId, setSelectedId] = useState(REGIONAL_HOTSPOTS[0].id);
  const selected = REGIONAL_HOTSPOTS.find(h => h.id === selectedId)!;

  return (
    <Card className="p-5">
      <CardTitle icon={<Globe2 className="w-4 h-4" />} iconClass="bg-purple-500/20 text-purple-300" title="Regional Hotspots" subtitle="Click a marker or a hub to inspect it" />
      <WorldMap hotspots={REGIONAL_HOTSPOTS} selectedId={selectedId} onSelect={setSelectedId} showLegend={false} />
      <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-rose-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">
            {selected.city}, {selected.country}
          </div>
          <div className="text-xs text-slate-300">{selected.label}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-extrabold text-rose-300">{selected.stat}</div>
          <Pill className="border-rose-500/40 text-rose-300 mt-1">{selected.density}</Pill>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {REGIONAL_HOTSPOTS.map(h => (
          <button
            key={h.id}
            onClick={() => setSelectedId(h.id)}
            className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
              selectedId === h.id ? 'border-purple-400/60 bg-purple-500/15' : 'border-white/10 hover:bg-white/5'
            }`}
          >
            <div className="font-bold text-white">{h.city}</div>
            <div className="text-slate-400 truncate">{h.stat}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function LiquidationBars() {
  const max = Math.max(...TOP_LIQUIDATIONS_DATA.map(r => r.volume));
  return (
    <Card className="p-5">
      <CardTitle icon={<Activity className="w-4 h-4" />} iconClass="bg-rose-500/20 text-rose-400" title="Liquidation Volume by Pair" subtitle="Last 60 minutes" />
      <div className="space-y-4">
        {TOP_LIQUIDATIONS_DATA.map(r => (
          <div key={r.pair}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-2 font-semibold text-white">
                <CoinIcon coin={r.iconType} size={20} /> {r.pair}
              </span>
              <span className="font-mono-numbers text-slate-300">
                ${r.amount} <span className="text-rose-400 font-bold ml-1">{r.delta}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-linear-to-r from-purple-500 to-rose-500 glow-pink" style={{ width: `${(r.volume / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function LiveFeeds() {
  return (
    <div className="space-y-4">
      <PageHeader title="Live Feeds" subtitle="Real-time prices, liquidations and regional activity during the incident" />
      <Ticker />
      <div className="grid grid-cols-1 *:min-w-0 xl:grid-cols-[1.6fr_1fr] gap-4">
        <div className="space-y-4 min-w-0">
          <PriceChart />
          <TradeStream />
        </div>
        <div className="space-y-4 min-w-0">
          <Hotspots />
          <LiquidationBars />
        </div>
      </div>
    </div>
  );
}
