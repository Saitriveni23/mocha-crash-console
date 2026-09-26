import { Activity, Globe2, MapPin, Pause, Play, Radio, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardTitle, CoinIcon, LiveDot, PageHeader } from '../components/ui';
import WorldMap from '../components/WorldMap';
import { MARKET_PAIRS, REGIONAL_HOTSPOTS, TOP_LIQUIDATIONS_DATA } from '../mockData';
import { useDashboard } from '../store';
import type { LiveTradeFeedItem } from '../types';

const TYPE_STYLE: Record<LiveTradeFeedItem['type'], string> = {
  LIQUIDATION: 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30',
  SELL:        'bg-[#D9A35E]/10 text-[#D9A35E] border-[#D9A35E]/30',
  BUY:         'bg-[#48D597]/10 text-[#48D597] border-[#48D597]/30',
};

const fmtPrice = (p: number) => p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: p < 10 ? 4 : 2 });

// ─── Ticker marquee ───────────────────────────────────
function Ticker() {
  const { metrics } = useDashboard();
  const pairs = MARKET_PAIRS.map(p => (p.coin === 'btc' ? { ...p, price: metrics.btcPrice } : p));
  return (
    <Card className="py-2.5 overflow-hidden">
      <div className="flex w-max animate-marquee">
        {[...pairs, ...pairs].map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 px-6 border-r border-[#2A211D]">
            <CoinIcon coin={p.coin} size={20} />
            <span className="text-xs font-bold text-[#F6EBDD]">{p.symbol}</span>
            <span className="text-xs font-semibold text-[#F6EBDD] font-mono-numbers">${fmtPrice(p.price)}</span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${p.changePercent < 0 ? 'text-[#F87171]' : 'text-[#48D597]'}`}>
              {p.changePercent < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {p.changePercent}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── SVG Candlestick Chart ────────────────────────────
interface OHLCCandle { time: string; open: number; close: number; high: number; low: number; }

function SVGCandleChart({ candles, minP, maxP }: { candles: OHLCCandle[]; minP: number; maxP: number }) {
  const [hovered, setHovered] = useState<{ c: OHLCCandle; i: number } | null>(null);

  const W = 900, H = 270;
  const PAD = { top: 10, right: 6, bottom: 28, left: 78 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const toY = (v: number) => PAD.top + chartH - ((v - minP) / (maxP - minP)) * chartH;

  const n = candles.length;
  const step = chartW / n;
  const candleW = Math.max(2, step * 0.65);
  const yTicks = Array.from({ length: 5 }, (_, i) => minP + ((maxP - minP) * i) / 4);

  return (
    <div className="relative w-full" style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        {/* Grid + Y labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="#2A211D" strokeWidth={1} />
            <text x={PAD.left - 7} y={toY(v) + 4} textAnchor="end" fill="#A49A92" fontSize={10} fontFamily="monospace">
              {v >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 0 }) : v.toFixed(4)}
            </text>
          </g>
        ))}

        {/* X labels every 6th */}
        {candles.map((c, i) => i % 6 === 0 && (
          <text key={i} x={PAD.left + i * step + step / 2} y={H - 6} textAnchor="middle" fill="#A49A92" fontSize={10} fontFamily="monospace">
            {c.time}
          </text>
        ))}

        {/* Candles */}
        {candles.map((c, i) => {
          const isUp = c.close >= c.open;
          const color = isUp ? '#48D597' : '#F87171';
          const cx = PAD.left + i * step + step / 2;
          const bodyTop = Math.min(toY(c.open), toY(c.close));
          const bodyBot = Math.max(toY(c.open), toY(c.close));
          const bodyH = Math.max(bodyBot - bodyTop, 1.5);
          const isHov = hovered?.i === i;
          return (
            <g key={i} style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHovered({ c, i })}
              onMouseLeave={() => setHovered(null)}>
              {/* Upper wick */}
              <line x1={cx} y1={toY(c.high)} x2={cx} y2={bodyTop} stroke={color} strokeWidth={1.5} opacity={0.85} />
              {/* Lower wick */}
              <line x1={cx} y1={bodyTop + bodyH} x2={cx} y2={toY(c.low)} stroke={color} strokeWidth={1.5} opacity={0.85} />
              {/* Body */}
              <rect x={cx - candleW / 2} y={bodyTop} width={candleW} height={bodyH} fill={color} rx={1.5} opacity={isHov ? 1 : 0.88} />
              {/* Invisible hit area */}
              <rect x={PAD.left + i * step} y={PAD.top} width={step} height={chartH} fill="transparent" />
            </g>
          );
        })}

        {/* Hover crosshair */}
        {hovered && (
          <line
            x1={PAD.left + hovered.i * step + step / 2} y1={PAD.top}
            x2={PAD.left + hovered.i * step + step / 2} y2={H - PAD.bottom}
            stroke="#D9A35E" strokeWidth={1} strokeDasharray="3,3" opacity={0.6}
          />
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (() => {
        const { c, i } = hovered;
        const isUp = c.close >= c.open;
        const leftSide = i < n * 0.6;
        return (
          <div className={`absolute top-1 pointer-events-none z-20 ${leftSide ? 'left-[90px]' : 'right-2'}`}>
            <div className="bg-[#1F1916] border border-[#2A211D] rounded-2xl px-4 py-3 shadow-2xl min-w-[160px]">
              <div className="text-[10px] text-[#A49A92] font-semibold mb-2">{c.time}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {([['O', c.open], ['H', c.high], ['L', c.low], ['C', c.close]] as [string, number][]).map(([l, v]) => (
                  <div key={l} className="flex gap-1.5 items-center">
                    <span className="text-[#A49A92]">{l}</span>
                    <span className={`font-bold font-mono-numbers ${isUp ? 'text-[#48D597]' : 'text-[#F87171]'}`}>
                      {v >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : v.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Price Chart with candlesticks ───────────────────
function PriceChart() {
  const { btcSeries, metrics } = useDashboard();
  const [coin, setCoin] = useState(MARKET_PAIRS[0].coin);
  const pair = MARKET_PAIRS.find(p => p.coin === coin)!;
  const ratio = pair.price / 61482.32;
  const price = coin === 'btc' ? metrics.btcPrice : pair.price;

  const rawData = btcSeries.map(d => ({ time: d.time, p: +(d.price * ratio).toFixed(pair.price < 10 ? 4 : 2) }));
  const candles: OHLCCandle[] = rawData.map((d, i) => {
    const prev = rawData[i - 1]?.p ?? d.p;
    const open = prev, close = d.p;
    const swing = Math.abs(open - close);
    const wick = swing * 0.45 + open * 0.00025;
    return { time: d.time, open, close, high: Math.max(open, close) + wick, low: Math.min(open, close) - wick };
  });

  const allP = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...allP) * 0.9998;
  const maxP = Math.max(...allP) * 1.0002;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CoinIcon coin={pair.coin} size={40} />
          <div>
            <div className="text-sm font-semibold text-[#A49A92]">{pair.symbol}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#F6EBDD] font-mono-numbers">${fmtPrice(price)}</span>
              <span className={`text-sm font-bold ${pair.changePercent < 0 ? 'text-[#F87171]' : 'text-[#48D597]'}`}>{pair.changePercent}%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl bg-[#090807] border border-[#2A211D]">
          {MARKET_PAIRS.map(p => (
            <button key={p.coin} onClick={() => setCoin(p.coin)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${coin === p.coin ? 'bg-gradient-to-r from-[#D9A35E] to-[#B66A3C] text-[#090807]' : 'text-[#A49A92] hover:text-[#F6EBDD]'}`}>
              {p.symbol.split('/')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          ['24h High', `$${fmtPrice(pair.high24h)}`, 'text-[#48D597]'],
          ['24h Low',  `$${fmtPrice(pair.low24h)}`,  'text-[#F87171]'],
          ['24h Vol',  `$${pair.volume24h}`,          'text-[#F6EBDD]'],
        ].map(([label, value, cls]) => (
          <div key={label} className="rounded-2xl bg-[#090807] border border-[#2A211D] px-3 py-2.5">
            <div className="text-[10px] text-[#A49A92] font-semibold">{label}</div>
            <div className={`text-sm font-bold font-mono-numbers mt-0.5 ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      <SVGCandleChart candles={candles} minP={minP} maxP={maxP} />
    </Card>
  );
}

// ─── Live Trade Stream ────────────────────────────────
function TradeStream() {
  const { feed, settings, setSettings } = useDashboard();
  const cell = settings.compactMode ? 'py-1.5' : 'py-2.5';
  const [filter, setFilter] = useState<'ALL' | LiveTradeFeedItem['type']>('ALL');
  const rows = feed.filter(f => filter === 'ALL' || f.type === filter).slice(0, 14);

  return (
    <Card className="p-5">
      <CardTitle
        icon={<Radio className="w-4 h-4" />}
        title={<span className="flex items-center gap-2">Live Trade Stream {settings.live && <LiveDot />}</span>}
        subtitle="Liquidations and large orders across all venues"
        right={
          <button onClick={() => setSettings(s => ({ ...s, live: !s.live }))} className="mt-btn-ghost flex items-center gap-1.5">
            {settings.live ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {settings.live ? 'Pause' : 'Resume'}
          </button>
        }
      />
      <div className="flex gap-2 mb-3">
        {(['ALL', 'LIQUIDATION', 'SELL', 'BUY'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-colors ${filter === f ? 'bg-[#D9A35E]/15 border-[#D9A35E]/40 text-[#D9A35E]' : 'border-[#2A211D] text-[#A49A92] hover:text-[#F6EBDD]'}`}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-[13px] min-w-[640px]">
          <thead>
            <tr className="text-[10px] text-[#A49A92] text-left border-b border-[#2A211D]">
              {['Time', 'Pair', 'Type', 'Amount', 'Price', 'Value', 'Hub'].map(h => (
                <th key={h} className={`font-semibold py-2 pr-3 ${['Amount','Price','Value'].includes(h) ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-[#2A211D] last:border-0 animate-row-flash hover:bg-[#D9A35E]/3 transition-colors">
                <td className={`${cell} pr-3 text-[#A49A92] font-mono-numbers text-xs`}>{r.time}</td>
                <td className={`${cell} pr-3 font-semibold text-[#F6EBDD]`}>{r.pair}</td>
                <td className={`${cell} pr-3`}><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_STYLE[r.type]}`}>{r.type}</span></td>
                <td className={`${cell} pr-3 text-right font-mono-numbers text-[#F6EBDD]`}>{r.amount}</td>
                <td className={`${cell} pr-3 text-right font-mono-numbers text-[#F6EBDD]`}>{r.price}</td>
                <td className={`${cell} pr-3 text-right font-mono-numbers font-bold ${r.type === 'BUY' ? 'text-[#48D597]' : 'text-[#F87171]'}`}>{r.value}</td>
                <td className={`${cell} text-[#A49A92] text-xs`}>{r.sourceHub}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Regional Hotspots Map ────────────────────────────
function Hotspots() {
  const [selectedId, setSelectedId] = useState(REGIONAL_HOTSPOTS[0].id);
  const selected = REGIONAL_HOTSPOTS.find(h => h.id === selectedId)!;

  return (
    <Card className="p-5">
      <CardTitle icon={<Globe2 className="w-4 h-4" />} iconClass="bg-[#D9A35E]/15 text-[#D9A35E]" title="Global Market Pulse" subtitle="Click a marker or a hub to inspect it" />
      <WorldMap hotspots={REGIONAL_HOTSPOTS} selectedId={selectedId} onSelect={setSelectedId} showLegend={false} />
      <div className="mt-4 rounded-2xl border border-[#F87171]/25 bg-[#F87171]/8 p-3 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-[#F87171] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#F6EBDD]">{selected.city}, {selected.country}</div>
          <div className="text-xs text-[#A49A92]">{selected.label}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-[#F87171]">{selected.stat}</div>
          <div className="mt-gold-badge mt-1">{selected.density}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {REGIONAL_HOTSPOTS.map(h => (
          <button key={h.id} onClick={() => setSelectedId(h.id)} className={`text-left px-3 py-2 rounded-xl border text-xs transition-all hover:scale-[1.01] ${selectedId === h.id ? 'border-[#D9A35E]/40 bg-[#D9A35E]/8 text-[#D9A35E]' : 'border-[#2A211D] text-[#A49A92] hover:border-[#D9A35E]/20'}`}>
            <div className="font-bold text-[#F6EBDD]">{h.city}</div>
            <div className="text-[#A49A92] truncate">{h.stat}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ─── Liquidation Bars ─────────────────────────────────
function LiquidationBars() {
  const max = Math.max(...TOP_LIQUIDATIONS_DATA.map(r => r.volume));
  return (
    <Card className="p-5">
      <CardTitle icon={<Activity className="w-4 h-4" />} iconClass="bg-[#F87171]/15 text-[#F87171]" title="Liquidation Volume by Pair" subtitle="Last 60 minutes" />
      <div className="space-y-4">
        {TOP_LIQUIDATIONS_DATA.map(r => (
          <div key={r.pair}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-2 font-semibold text-[#F6EBDD]">
                <CoinIcon coin={r.iconType} size={20} /> {r.pair}
              </span>
              <span className="font-mono-numbers text-[#A49A92]">
                ${r.amount} <span className="text-[#F87171] font-bold ml-1">{r.delta}</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#2A211D] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#D9A35E] to-[#F87171]" style={{ width: `${(r.volume / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────
export default function LiveFeeds() {
  return (
    <div className="space-y-5">
      <PageHeader title="Global Market Pulse" subtitle="Real-time AI monitoring of crashes, liquidity and institutional activity" />
      <Ticker />
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">
        <div className="space-y-5 min-w-0">
          <PriceChart />
          <TradeStream />
        </div>
        <div className="space-y-5 min-w-0">
          <Hotspots />
          <LiquidationBars />
        </div>
      </div>
    </div>
  );
}
