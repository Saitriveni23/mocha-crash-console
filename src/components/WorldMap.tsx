import { AlertTriangle, Headphones, Frown, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { RegionalHotspot } from '../types';

// Equirectangular projection cropped to 80°N – 60°S
const W = 1000;
const H = (140 / 360) * W;
const project = (lon: number, lat: number): [number, number] => [((lon + 180) / 360) * W, ((80 - lat) / 140) * H];

// Rough continent outlines as [lon, lat] pairs; filled with a dot pattern
const CONTINENTS: [number, number][][] = [
  // North America
  [[-168, 66], [-160, 70], [-140, 70], [-125, 72], [-95, 74], [-80, 73], [-65, 62], [-55, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 30], [-97, 26], [-97, 21], [-92, 18], [-87, 21], [-84, 15], [-83, 10], [-78, 8], [-80, 7], [-85, 11], [-92, 15], [-105, 20], [-110, 24], [-115, 30], [-118, 34], [-124, 40], [-124, 48], [-130, 55], [-140, 60], [-152, 58], [-165, 55], [-160, 60], [-166, 64]],
  // Greenland
  [[-50, 60], [-42, 60], [-20, 70], [-20, 80], [-40, 83], [-60, 81], [-70, 77], [-55, 70]],
  // South America
  [[-80, 8], [-72, 12], [-62, 10], [-50, 2], [-35, -5], [-38, -12], [-40, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-68, -52], [-72, -53], [-75, -47], [-73, -38], [-71, -28], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-77, 4]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [-1, 50], [3, 51], [8, 54], [8, 57], [5, 60], [5, 62], [12, 65], [16, 69], [25, 71], [30, 70], [40, 67], [42, 62], [40, 55], [30, 46], [28, 41], [24, 38], [22, 40], [19, 42], [16, 38], [12, 44], [8, 44], [3, 43], [-1, 37]],
  // Great Britain
  [[-6, 50], [2, 51], [0, 53], [-2, 56], [-3, 58], [-6, 58], [-5, 54], [-3, 52]],
  // Africa
  [[-17, 21], [-13, 28], [-9, 32], [-5, 36], [10, 37], [11, 33], [20, 31], [32, 31], [34, 28], [38, 20], [43, 12], [51, 12], [51, 10], [45, 2], [40, -5], [40, -15], [35, -24], [32, -29], [27, -34], [20, -35], [18, -30], [12, -17], [13, -8], [9, -1], [9, 4], [5, 5], [-4, 5], [-8, 4], [-13, 8], [-17, 13]],
  // Madagascar
  [[44, -16], [50, -15], [48, -25], [44, -24]],
  // Asia
  [[28, 41], [40, 42], [42, 37], [36, 36], [35, 32], [35, 28], [43, 13], [52, 15], [58, 20], [60, 24], [57, 26], [52, 28], [50, 30], [56, 26], [62, 25], [67, 24], [72, 20], [77, 8], [80, 13], [80, 16], [88, 22], [92, 22], [94, 17], [98, 16], [98, 8], [103, 1], [104, 10], [109, 12], [108, 20], [114, 22], [121, 30], [122, 37], [119, 39], [122, 40], [128, 38], [130, 42], [135, 44], [141, 52], [137, 55], [142, 59], [155, 59], [162, 62], [170, 65], [180, 68], [180, 71], [140, 73], [110, 77], [100, 78], [80, 73], [68, 69], [60, 69], [55, 68], [42, 67], [40, 67], [42, 62], [40, 55], [30, 46]],
  // Japan
  [[130, 31], [135, 34], [140, 35], [142, 40], [141, 45], [145, 44], [140, 41], [139, 38], [135, 35], [131, 34]],
  // Sumatra / Java
  [[95, 5], [106, -6], [115, -8], [120, -9], [118, -6], [106, -3], [104, -2], [98, 2]],
  // Borneo
  [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]],
  // New Guinea
  [[131, -1], [141, -3], [150, -10], [141, -9], [137, -5]],
  // Australia
  [[114, -22], [114, -34], [118, -35], [124, -33], [131, -31], [138, -35], [141, -38], [147, -38], [150, -37], [153, -28], [153, -25], [146, -19], [142, -11], [141, -17], [136, -12], [130, -12], [126, -14], [122, -18]],
];

const toPath = (poly: [number, number][]) =>
  poly.map(([lon, lat], i) => `${i ? 'L' : 'M'}${project(lon, lat).map(n => n.toFixed(1)).join(',')}`).join('') + 'Z';

// Ambient activity glows (smaller purple dots across the globe)
const AMBIENT: [number, number, number][] = [
  [-87, 42, 0.8], [-118, 34, 0.7], [-99, 19, 0.6], [2, 48, 0.9], [13, 52, 0.7], [37, 55, 0.8], [55, 25, 0.9], [72, 19, 0.8],
  [77, 28, 0.6], [121, 31, 0.9], [114, 22, 0.8], [127, 37, 0.8], [151, -34, 0.7], [28, -26, 0.6], [3, 6, 0.5], [31, 30, 0.6],
  [-58, -34, 0.6], [-43, -22, 0.6], [100, 13, 0.7], [-79, 44, 0.6],
];

const TYPE_STYLE = {
  liquidation: { color: '#D9A35E', core: 'bg-[#F87171]', Icon: AlertTriangle },
  sentiment: { color: '#f43f5e', core: 'bg-pink-600', Icon: Frown },
  tickets: { color: '#fbbf24', core: 'bg-emerald-500', Icon: Headphones },
};

export default function WorldMap({
  hotspots,
  labelled = [],
  selectedId,
  onSelect,
  showLegend = true,
}: {
  hotspots: RegionalHotspot[];
  labelled?: string[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showLegend?: boolean;
}) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <div
        className="relative w-full transition-transform duration-500"
        style={{ aspectRatio: `${W} / ${H}`, transform: `scale(${zoom})`, transformOrigin: '50% 40%' }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="map-dots" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="3.5" cy="3.5" r="1.7" fill="#5b6aa8" fillOpacity="0.55" />
            </pattern>
          </defs>
          {CONTINENTS.map((poly, i) => (
            <path key={i} d={toPath(poly)} fill="url(#map-dots)" />
          ))}
        </svg>

        {AMBIENT.map(([lon, lat, s], i) => {
          const [x, y] = project(lon, lat);
          return (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${(x / W) * 100}%`,
                top: `${(y / H) * 100}%`,
                width: 26 * s,
                height: 26 * s,
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(168,85,247,0.9) 0%, rgba(139,92,246,0.35) 45%, transparent 70%)',
              }}
            />
          );
        })}

        {hotspots.map(h => {
          const [x, y] = project(h.lon, h.lat);
          const t = TYPE_STYLE[h.type];
          const size = h.density === 'Extreme' ? 110 : h.density === 'High' ? 70 : 46;
          const showLabel = labelled.includes(h.id) || selectedId === h.id;
          return (
            <div key={h.id} className="absolute" style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}>
              <div
                className="absolute rounded-full animate-heat pointer-events-none"
                style={{
                  width: size,
                  height: size,
                  background: `radial-gradient(circle, ${t.color} 0%, ${t.color}aa 25%, rgba(168,85,247,0.35) 55%, transparent 72%)`,
                }}
              />
              <button
                onClick={() => onSelect?.(h.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${t.core} border-2 border-white/80 flex items-center justify-center shadow-[0_0_14px_rgba(255,42,95,0.9)] hover:scale-125 transition-transform ${selectedId === h.id ? 'scale-125 ring-2 ring-white' : ''}`}
                title={`${h.city}: ${h.label}`}
              >
                <t.Icon className="w-3 h-3 text-white" />
              </button>
              {showLabel && (
                <div
                  className={`absolute whitespace-nowrap ${
                    x / W < 0.35 ? '-left-4 top-5' : x / W > 0.7 ? '-right-4 bottom-5' : 'left-1/2 -translate-x-1/2 bottom-5'
                  } px-2.5 py-1.5 rounded-lg bg-[#090807]/90 border border-white/15 text-[11px] leading-tight text-white shadow-xl backdrop-blur pointer-events-none z-10`}
                >
                  <span className="font-bold">{h.city}:</span> {h.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute right-2 bottom-2 flex flex-col rounded-lg overflow-hidden border border-white/10 bg-[#11162d]/90">
        <button onClick={() => setZoom(z => Math.min(2, z + 0.25))} className="p-1.5 text-[#A49A92] hover:bg-white/10" aria-label="Zoom in">
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setZoom(z => Math.max(1, z - 0.25))} className="p-1.5 text-[#A49A92] hover:bg-white/10 border-t border-white/10" aria-label="Zoom out">
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {showLegend && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 px-3 py-1.5 rounded-lg bg-[#090807]/85 border border-white/10">
          <div className="w-40 h-1.5 rounded-full bg-linear-to-r from-rose-500 via-amber-400 to-emerald-400" />
          <div className="flex justify-between text-[9px] text-[#A49A92] mt-1 font-semibold">
            <span>High Density</span>
            <span>Low Density</span>
          </div>
        </div>
      )}
    </div>
  );
}
