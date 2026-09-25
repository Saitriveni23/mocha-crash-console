import React, { useState, useEffect, useRef } from 'react';
import {
  ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart
} from 'recharts';
import { 
  Coffee, LayoutDashboard, AlertCircle, FileText, Activity, Settings, Cpu, Search, Bell, Sun, User, 
  ChevronDown, ArrowUpRight, ArrowDownRight, ArrowDown, Send, MessageSquare, AlertTriangle, ActivitySquare
} from 'lucide-react';
import './App.css';

// --- Types ---
type DataPoint = { time: string; open: number; close: number; high: number; low: number; volume: number; range: [number, number] };
type OrderBookEntry = { price: number; size: number };
type Trade = { id: string; time: string; price: number; size: number; side: 'Buy' | 'Sell' };

// --- Helpers ---
const formatPrice = (p: number) => p.toFixed(2);

// --- Custom Candlestick Shape ---
const Candlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isGrowing = payload.close >= payload.open;
  const color = isGrowing ? '#4ADE80' : '#F87171';
  
  const openCloseRange = Math.abs(payload.open - payload.close) || 1;
  const pixelsPerDollar = height / openCloseRange;
  
  const highY = y - (payload.high - Math.max(payload.open, payload.close)) * pixelsPerDollar;
  const lowY = y + height + (Math.min(payload.open, payload.close) - payload.low) * pixelsPerDollar;
  
  return (
    <g>
      <line x1={x + width/2} y1={highY} x2={x + width/2} y2={lowY} stroke={color} strokeWidth={1} />
      <rect x={x} y={y} width={width} height={Math.max(height, 1)} fill={color} stroke={color} />
    </g>
  );
};

// --- COMPONENTS FOR TABS ---

const DashboardTab = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0B0908]">
      <div className="h-screen relative flex flex-col items-center justify-center">
        <div 
          className="absolute inset-0 z-0" 
          style={{ backgroundImage: "url('/landing.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7 }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0908]/80 via-transparent to-[#0B0908] z-0"></div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#E8A14A]/40 to-transparent rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(232,161,74,0.4)] border border-[#E8A14A]/30 backdrop-blur-md">
            <Coffee className="text-[#E8A14A] w-12 h-12" />
          </div>
          <h1 className="text-6xl font-bold tracking-widest text-[#F5E7D8] mb-4">MOCHA <span className="text-[#E8A14A]">TRADE</span></h1>
          <p className="text-xl text-[#F5E7D8]/70 font-light tracking-wide max-w-2xl">The future of autonomous, high-frequency, AI-powered luxury trading. Scale your assets at the speed of thought.</p>
        </div>
        
        <button 
          onClick={scrollToMap}
          className="absolute bottom-12 z-10 flex flex-col items-center text-[#E8A14A] hover:text-[#F5E7D8] transition-colors animate-bounce cursor-pointer"
        >
          <span className="text-sm tracking-widest mb-2 font-medium uppercase">Global Network</span>
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>

      <div ref={mapRef} className="h-screen relative flex flex-col items-center justify-center bg-[#0B0908]">
        <div 
          className="absolute inset-0 z-0" 
          style={{ backgroundImage: "url('/map.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.9 }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0908] via-transparent to-[#0B0908] z-0"></div>
        <div className="relative z-10 w-full px-20">
           <h2 className="text-4xl font-bold text-[#E8A14A] mb-4">Global Expanse</h2>
           <p className="text-[#F5E7D8]/70 max-w-xl text-lg">Our trading nodes are strategically placed across major financial hubs to ensure microsecond latency execution worldwide.</p>
        </div>
      </div>
    </div>
  );
};

const IncidentsTab = () => {
  const [volatility, setVolatility] = useState(12.5);
  const [momentum, setMomentum] = useState(-5.2);
  const [liquidity, setLiquidity] = useState(88.4);
  const [tickets, setTickets] = useState([
    { id: 'TCK-092', user: 'AlphaFund', issue: 'Execution delayed by 4ms', priority: 'Low', status: 'Resolved' },
    { id: 'TCK-093', user: 'RetailGroup_B', issue: 'Margin call warning not received', priority: 'Medium', status: 'Open' },
    { id: 'TCK-094', user: 'OmegaCorp', issue: 'Massive slippage on ETH block', priority: 'High', status: 'Escalated' },
  ]);

  // Risk calculation
  const riskScore = ((volatility / 20) * 0.4 + (Math.abs(momentum) / 10) * 0.3 + ((100 - liquidity) / 100) * 0.3) * 100;
  const isCrashing = riskScore > 65;

  const getActionPlan = () => {
    if (riskScore < 30) return "Normal Operations. Monitor liquidity pools.";
    if (riskScore < 65) return "Elevated Risk. Reduce leverage limits by 25%.";
    return "MARKET CRASH PROTOCOL. Halt all margin trading. Escalate Tier 1 & 2 tickets to C-Suite immediately. Trigger auto-liquidations.";
  };

  useEffect(() => {
    if (isCrashing && tickets.some(t => t.priority === 'High' && t.status !== 'C-Suite Escalated')) {
      const timer = setTimeout(() => {
        setTickets(prev => prev.map(t => 
          (t.priority === 'High' || t.priority === 'Medium') ? { ...t, status: 'C-Suite Escalated', priority: 'CRITICAL' } : t
        ));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCrashing, tickets]);

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
      <div className="flex gap-8">
        <div className="surface-card flex-1 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F87171]/5 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-[#E8A14A] font-bold tracking-wider mb-6 flex items-center gap-2"><ActivitySquare className="w-5 h-5"/> Risk Score Analysis</h3>
          <div className="space-y-6">
            <div>
               <div className="flex justify-between text-sm mb-1"><span className="text-[#F5E7D8]/60">Volatility Component</span> <span className="text-[#F5E7D8]">{volatility}%</span></div>
               <div className="h-1.5 w-full bg-[#0B0908] rounded-full overflow-hidden"><div className="h-full bg-[#E8A14A]" style={{width: `${volatility}%`}}></div></div>
            </div>
            <div>
               <div className="flex justify-between text-sm mb-1"><span className="text-[#F5E7D8]/60">Momentum Component</span> <span className="text-[#F5E7D8]">{momentum}%</span></div>
               <div className="h-1.5 w-full bg-[#0B0908] rounded-full overflow-hidden"><div className="h-full bg-[#E8A14A]" style={{width: `${Math.abs(momentum)*2}%`}}></div></div>
            </div>
            <div>
               <div className="flex justify-between text-sm mb-1"><span className="text-[#F5E7D8]/60">Liquidity Drain</span> <span className="text-[#F5E7D8]">{100 - liquidity}%</span></div>
               <div className="h-1.5 w-full bg-[#0B0908] rounded-full overflow-hidden"><div className="h-full bg-[#E8A14A]" style={{width: `${100-liquidity}%`}}></div></div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#F5E7D8]/10 flex items-center justify-between">
            <div>
              <div className="text-sm text-[#F5E7D8]/50 mb-1">Composite Risk Score</div>
              <div className={`text-4xl font-bold ${isCrashing ? 'text-[#F87171] drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'text-[#E8A14A]'}`}>{riskScore.toFixed(1)}</div>
            </div>
            <div className="w-1/2 bg-[#0B0908] p-4 rounded-xl border border-[#F5E7D8]/10">
               <div className="text-xs text-[#E8A14A] mb-2 uppercase font-bold">Auto-Generated Action Plan</div>
               <div className={`text-sm ${isCrashing ? 'text-[#F87171] font-bold' : 'text-[#F5E7D8]/70'}`}>{getActionPlan()}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setVolatility(v => Math.min(v + 15, 100))} className="px-3 py-1 bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30 rounded text-xs">Simulate Crash</button>
            <button onClick={() => {setVolatility(12.5); setMomentum(-5.2); setLiquidity(88.4);}} className="px-3 py-1 bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30 rounded text-xs">Normalize</button>
          </div>
        </div>
      </div>

      <div className="surface-card flex-1 p-6">
         <h3 className="text-[#E8A14A] font-bold tracking-wider mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Support Tickets & Escalation</h3>
         <table className="w-full text-left text-sm">
           <thead>
             <tr className="text-[#F5E7D8]/40 border-b border-[#F5E7D8]/10">
               <th className="pb-3 font-normal">Ticket ID</th>
               <th className="pb-3 font-normal">Client</th>
               <th className="pb-3 font-normal">Issue</th>
               <th className="pb-3 font-normal">Priority</th>
               <th className="pb-3 font-normal">Status</th>
             </tr>
           </thead>
           <tbody>
             {tickets.map(t => (
               <tr key={t.id} className="border-b border-[#F5E7D8]/5 hover:bg-[#F5E7D8]/5 transition-colors">
                 <td className="py-4 text-[#F5E7D8]/70">{t.id}</td>
                 <td className="py-4 font-medium">{t.user}</td>
                 <td className="py-4 text-[#F5E7D8]/70">{t.issue}</td>
                 <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      t.priority === 'CRITICAL' ? 'bg-[#F87171] text-[#0B0908] animate-pulse' :
                      t.priority === 'High' ? 'bg-[#F87171]/20 text-[#F87171]' :
                      t.priority === 'Medium' ? 'bg-[#E8A14A]/20 text-[#E8A14A]' : 'bg-[#4ADE80]/20 text-[#4ADE80]'
                    }`}>{t.priority}</span>
                 </td>
                 <td className="py-4">
                    <span className={`flex items-center gap-2 ${t.status.includes('Escalated') ? 'text-[#F87171] font-bold' : 'text-[#F5E7D8]/50'}`}>
                      {t.status.includes('Escalated') && <AlertTriangle className="w-4 h-4"/>}
                      {t.status}
                    </span>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
};

const SettingsTab = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex justify-center">
       <div className="w-full max-w-3xl flex flex-col gap-8">
         <h2 className="text-3xl font-bold text-[#F5E7D8] mb-2">Settings</h2>
         
         <div className="surface-card p-6 border-l-4 border-l-[#E8A14A]">
           <h3 className="text-[#E8A14A] font-bold tracking-wider mb-2 flex items-center gap-2"><Cpu className="w-5 h-5"/> AI Communication Templates</h3>
           <p className="text-[#F5E7D8]/50 text-sm mb-6">These templates lie inside the settings section and are automatically used by our AI system agents to send responses to user queries during high load.</p>
           
           <div className="space-y-4">
              <div className="bg-[#0B0908] border border-[#F5E7D8]/10 rounded-xl p-4">
                 <div className="flex justify-between items-center mb-2">
                   <div className="text-sm font-semibold text-[#F5E7D8]">High Volatility Auto-Response</div>
                   <div className="text-xs bg-[#4ADE80]/20 text-[#4ADE80] px-2 py-1 rounded">Agent Active</div>
                 </div>
                 <textarea className="w-full bg-[#1C1715] border border-[#F5E7D8]/10 rounded-lg p-3 text-sm text-[#F5E7D8]/70 outline-none focus:border-[#E8A14A]/40 transition-colors h-24" defaultValue="Hello {user}, we have detected unprecedented volatility in {asset}. Your margin limits have been temporarily adjusted to protect your portfolio. Our risk engine is monitoring this closely."></textarea>
                 <div className="mt-2 flex justify-end"><button className="text-xs flex items-center gap-1 text-[#E8A14A] hover:text-[#F5E7D8]"><Send className="w-3 h-3"/> Test Agent</button></div>
              </div>
              
              <div className="bg-[#0B0908] border border-[#F5E7D8]/10 rounded-xl p-4">
                 <div className="flex justify-between items-center mb-2">
                   <div className="text-sm font-semibold text-[#F5E7D8]">System Outage / Delay</div>
                   <div className="text-xs bg-[#4ADE80]/20 text-[#4ADE80] px-2 py-1 rounded">Agent Active</div>
                 </div>
                 <textarea className="w-full bg-[#1C1715] border border-[#F5E7D8]/10 rounded-lg p-3 text-sm text-[#F5E7D8]/70 outline-none focus:border-[#E8A14A]/40 transition-colors h-24" defaultValue="Notice: We are currently experiencing routing delays to the {exchange} exchange. Your orders are queued securely. We will escalate unresolved tickets to Tier 3 support automatically."></textarea>
                 <div className="mt-2 flex justify-end"><button className="text-xs flex items-center gap-1 text-[#E8A14A] hover:text-[#F5E7D8]"><Send className="w-3 h-3"/> Test Agent</button></div>
              </div>
           </div>
         </div>
       </div>
    </div>
  );
}


// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(3100);
  const [prevPrice, setPrevPrice] = useState(3100);
  
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [tape, setTape] = useState<Trade[]>([]);
  const [pnlData, setPnlData] = useState<any[]>([]);

  useEffect(() => {
    const initData: DataPoint[] = [];
    let lastClose = 3100;
    for (let i = 0; i < 60; i++) {
      const time = new Date(Date.now() - (60 - i) * 1000).toLocaleTimeString([], { hour12: false });
      const open = lastClose;
      const close = open + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      initData.push({ time: time.substring(0, 8), open, close, high, low, volume: Math.random() * 500 + 100, range: [open, close] });
      lastClose = close;
    }
    setData(initData);
    setCurrentPrice(lastClose);

    const initPnl = Array.from({length: 20}).map((_, i) => ({ time: i, val: 10000 + i*150 + (Math.random()-0.5)*500 }));
    setPnlData(initPnl);
  }, []);
  
  useEffect(() => {
    if (data.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }) + '.' + now.getMilliseconds().toString().padStart(3, '0');
      
      setCurrentPrice(prev => {
        setPrevPrice(prev);
        const change = (Math.random() - 0.45) * 8; 
        const newPrice = Math.max(0, prev + change);
        
        setData(d => {
          const open = prev;
          const close = newPrice;
          const high = Math.max(open, close) + Math.random() * 3;
          const low = Math.min(open, close) - Math.random() * 3;
          return [...d.slice(1), { time: timeStr.substring(0, 8), open, close, high, low, volume: Math.random() * 800 + 200, range: [open, close] }];
        });

        const newBids = Array.from({ length: 10 }).map((_, i) => ({ price: newPrice - (i + 1) * 0.25, size: Math.floor(Math.random() * 50) + 20 }));
        const newAsks = Array.from({ length: 10 }).map((_, i) => ({ price: newPrice + (i + 1) * 0.25, size: Math.floor(Math.random() * 50) + 20 }));
        setBids(newBids);
        setAsks(newAsks);

        const side = Math.random() > 0.5 ? 'Sell' : 'Buy';
        setTape(t => [{ id: Math.random().toString(), time: timeStr, price: newPrice, size: Math.floor(Math.random() * 15) + 1, side }, ...t.slice(0, 14)]);

        return newPrice;
      });
      
    }, 1000); 

    return () => clearInterval(interval);
  }, [data.length]);

  const changePercent = data.length > 0 ? ((currentPrice - data[0].open) / data[0].open) * 100 : 0;
  
  const renderLiveMarketsTab = () => (
    <div className="flex-1 p-8 flex gap-8 overflow-hidden">
      <div className="flex-[2.5] flex flex-col gap-8 min-w-0">
         <div className="glass-panel flex-[1.5] p-6 flex flex-col relative group">
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#E8A14A]/40 to-transparent"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <span className="bg-[#E8A14A] text-[#0B0908] text-xs font-bold px-2 py-0.5 rounded">TCS India</span>
                   <span className="text-sm text-[#F5E7D8]/50">Tata Consultancy Services</span>
                </div>
                <div className="flex items-end gap-4">
                  <div className="text-4xl font-light tracking-tight">₹{formatPrice(currentPrice)}</div>
                  <div className={`text-sm font-medium mb-1 ${changePercent >= 0 ? 'text-success' : 'text-loss'} flex items-center`}>
                    {changePercent >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {formatPrice(Math.abs(currentPrice - 3100))} ({Math.abs(changePercent).toFixed(2)}%)
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 bg-[#1C1715] p-1 rounded-lg border border-[#F5E7D8]/5">
                 {['1D', '1W', '1M', '3M', 'YTD'].map(tf => (
                   <button key={tf} className={`px-3 py-1 text-xs font-medium rounded-md ${tf === '1D' ? 'bg-[#2A221F] text-[#E8A14A] shadow' : 'text-[#F5E7D8]/40 hover:text-[#F5E7D8]'}`}>{tf}</button>
                 ))}
              </div>
            </div>

            <div className="flex-1 relative w-full h-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5E7D8" strokeOpacity={0.03} vertical={false} />
                    <XAxis dataKey="time" stroke="#F5E7D8" strokeOpacity={0.3} fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="price" stroke="#F5E7D8" strokeOpacity={0.3} fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} orientation="right" />
                    <Tooltip contentStyle={{ backgroundColor: '#1C1715', borderColor: 'rgba(232, 161, 74, 0.2)', borderRadius: '12px' }} itemStyle={{ color: '#E8A14A' }} />
                    <Bar yAxisId="price" dataKey="range" shape={<Candlestick />} isAnimationActive={false} />
                  </ComposedChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="flex-1 flex gap-8 min-h-0">
            <div className="surface-card flex-1 p-5 flex flex-col hover-lift">
               <div className="text-sm font-semibold text-[#E8A14A] mb-4 flex justify-between">
                 MARKET DEPTH <span className="text-[#F5E7D8]/30 text-xs">Spread: 0.25</span>
               </div>
               <div className="flex-1 flex gap-4 text-xs font-mono overflow-hidden">
                 <div className="flex-1 flex flex-col">
                   <div className="flex justify-between text-[#F5E7D8]/40 mb-2 border-b border-[#F5E7D8]/10 pb-1"><span>Bid</span><span>Size</span></div>
                   <div className="flex-1 overflow-hidden flex flex-col">
                     {bids.map((b, i) => (
                       <div key={i} className="flex justify-between py-1 hover:bg-[#F5E7D8]/5 rounded px-1 cursor-pointer relative group">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 bg-[#4ADE80]/10 rounded-l" style={{ width: `${Math.min(100, b.size * 2)}%` }}></div>
                         <span className="text-success relative z-10">{formatPrice(b.price)}</span>
                         <span className="text-[#F5E7D8]/70 relative z-10">{b.size}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="flex-1 flex flex-col">
                   <div className="flex justify-between text-[#F5E7D8]/40 mb-2 border-b border-[#F5E7D8]/10 pb-1"><span>Ask</span><span>Size</span></div>
                   <div className="flex-1 overflow-hidden flex flex-col">
                     {asks.map((a, i) => (
                       <div key={i} className="flex justify-between py-1 hover:bg-[#F5E7D8]/5 rounded px-1 cursor-pointer relative">
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 bg-[#F87171]/10 rounded-r" style={{ width: `${Math.min(100, a.size * 2)}%` }}></div>
                         <span className="text-loss relative z-10">{formatPrice(a.price)}</span>
                         <span className="text-[#F5E7D8]/70 relative z-10">{a.size}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </div>

            <div className="surface-card flex-[1.2] p-5 flex flex-col hover-lift">
               <div className="text-sm font-semibold text-[#E8A14A] mb-4">TIME & SALES</div>
               <div className="flex justify-between text-[#F5E7D8]/40 mb-2 border-b border-[#F5E7D8]/10 pb-1 text-xs">
                 <span className="w-1/3">Time</span>
                 <span className="w-1/3 text-right">Price</span>
                 <span className="w-1/3 text-right">Qty</span>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar text-xs font-mono pr-2">
                  {tape.map((t, i) => (
                    <div key={i} className="flex justify-between py-1.5 hover:bg-[#F5E7D8]/5 rounded px-1 border-b border-[#F5E7D8]/5 last:border-0">
                      <span className="w-1/3 text-[#F5E7D8]/50">{t.time}</span>
                      <span className={`w-1/3 text-right ${t.side === 'Buy' ? 'text-success' : 'text-loss'}`}>{formatPrice(t.price)}</span>
                      <span className="w-1/3 text-right text-[#F5E7D8]/80">{t.size}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="w-[360px] flex flex-col gap-8 shrink-0 overflow-y-auto custom-scrollbar pr-2 pb-8">
         <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
               <div className="font-semibold text-lg">AI Decision Loop</div>
               <div className="text-xs bg-[#E8A14A]/20 text-[#E8A14A] px-2 py-1 rounded-full flex items-center gap-1 border border-[#E8A14A]/30">
                 <Cpu className="w-3 h-3" /> GPT-4 Active
               </div>
            </div>
            <div className="relative pl-4 border-l border-[#E8A14A]/20 space-y-6">
               <div className="relative">
                 <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#E8A14A] shadow-[0_0_10px_#E8A14A]"></div>
                 <div className="text-sm font-medium">Market Research</div>
                 <div className="text-xs text-[#F5E7D8]/50 mt-1">Analyzing order book liquidity...</div>
               </div>
               <div className="relative">
                 <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#E8A14A] shadow-[0_0_10px_#E8A14A]"></div>
                 <div className="text-sm font-medium">Pattern Recognition</div>
                 <div className="text-xs text-[#F5E7D8]/50 mt-1">Found micro-trend divergence.</div>
               </div>
               <div className="relative opacity-50">
                 <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#E8A14A] bg-[#1C1715]"></div>
                 <div className="text-sm font-medium">Risk Analysis</div>
                 <div className="text-xs mt-1">Calculating VaR exposure...</div>
                 <div className="h-1 w-full bg-[#1C1715] rounded-full mt-2 overflow-hidden border border-[#F5E7D8]/10">
                    <div className="h-full bg-[#E8A14A] w-[78%] animate-progress"></div>
                 </div>
               </div>
               <div className="relative opacity-30">
                 <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#F5E7D8]/30 bg-[#1C1715]"></div>
                 <div className="text-sm font-medium">Execute Trade</div>
                 <div className="text-xs mt-1">Waiting for risk clearance.</div>
               </div>
            </div>
            <div className="mt-8 bg-[#4ADE80]/10 border border-[#4ADE80]/30 rounded-xl p-4 flex items-center justify-between">
               <div>
                 <div className="text-xs text-[#4ADE80] font-semibold mb-1 uppercase tracking-wider">AI Recommendation</div>
                 <div className="text-lg font-bold">BUY 50 TCS</div>
               </div>
               <div className="w-12 h-12 rounded-full border-4 border-[#4ADE80]/20 border-t-[#4ADE80] flex items-center justify-center animate-spin">
                  <div className="text-xs font-bold text-[#4ADE80] animate-none" style={{animationDuration: '0s'}}>78%</div>
               </div>
            </div>
         </div>

         <div className="surface-card p-6 border-[#E8A14A]/10 hover-lift relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8A14A]/5 rounded-full blur-3xl"></div>
            <div className="text-lg font-semibold mb-4">Quick Trade</div>
            <div className="flex gap-2 p-1 bg-[#0B0908] rounded-lg mb-6 border border-[#F5E7D8]/5">
               <button className="flex-1 bg-[#1C1715] text-sm py-1.5 rounded-md font-medium text-[#E8A14A] shadow">Limit</button>
               <button className="flex-1 text-[#F5E7D8]/40 text-sm py-1.5 font-medium hover:text-[#F5E7D8]">Market</button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-[#0B0908] border border-[#F5E7D8]/10 rounded-xl p-3 flex justify-between items-center">
                 <span className="text-sm text-[#F5E7D8]/50">Qty</span>
                 <input type="text" defaultValue="50" className="bg-transparent text-right text-lg font-medium outline-none w-20 text-[#F5E7D8]" />
              </div>
              <div className="bg-[#0B0908] border border-[#F5E7D8]/10 rounded-xl p-3 flex justify-between items-center">
                 <span className="text-sm text-[#F5E7D8]/50">Price</span>
                 <input type="text" value={formatPrice(currentPrice)} readOnly className="bg-transparent text-right text-lg font-medium outline-none w-24 text-[#F5E7D8]" />
              </div>
            </div>
            <div className="flex gap-3">
               <button className="flex-1 bg-gradient-to-b from-[#4ADE80] to-[#22c55e] text-[#0B0908] font-bold py-3 rounded-xl transition-transform hover:-translate-y-0.5">BUY</button>
               <button className="flex-1 bg-gradient-to-b from-[#F87171] to-[#ef4444] text-[#0B0908] font-bold py-3 rounded-xl transition-transform hover:-translate-y-0.5">SELL</button>
            </div>
         </div>

         <div className="surface-card p-6 hover-lift">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm font-semibold text-[#E8A14A]">PERFORMANCE</div>
              <div className="text-xs bg-[#E8A14A]/10 text-[#E8A14A] px-2 py-1 rounded">Today</div>
            </div>
            <div className="mb-6">
               <div className="text-3xl font-light text-success drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">+$12,450.00</div>
               <div className="text-sm text-[#F5E7D8]/50 mt-1">Daily Unrealized PNL</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div><div className="text-[#F5E7D8]/40 text-xs mb-1">Win Rate</div><div className="text-lg font-medium">84.2%</div></div>
               <div><div className="text-[#F5E7D8]/40 text-xs mb-1">AI Accuracy</div><div className="text-lg font-medium">92.5%</div></div>
            </div>
            <div className="h-20 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlData}>
                    <defs>
                      <linearGradient id="pnlGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8A14A" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#E8A14A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#E8A14A" strokeWidth={2} fill="url(#pnlGlow)" isAnimationActive={false} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#0B0908] text-[#F5E7D8] flex overflow-hidden relative font-sans">
      
      {/* Workspace Background Decoration - Only in Live Markets */}
      {activeTab === 'Live Markets' && (
        <div 
          className="absolute top-0 right-0 w-[45%] h-full pointer-events-none opacity-[0.15] z-0" 
          style={{ backgroundImage: "url('/bg-workspace.jpg')", backgroundSize: 'cover', backgroundPosition: 'left center', maskImage: 'linear-gradient(to right, transparent, black 80%)' }}
        ></div>
      )}

      {/* LEFT SIDEBAR */}
      <div className="w-[72px] bg-[#151210]/95 backdrop-blur-xl border-r border-[#E8A14A]/10 flex flex-col items-center py-6 z-10 shrink-0 shadow-2xl relative">
        <div className="w-12 h-12 bg-gradient-to-br from-[#E8A14A]/30 to-transparent rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(232,161,74,0.2)] border border-[#E8A14A]/20">
          <Coffee className="text-[#E8A14A] w-6 h-6" />
        </div>
        
        <div className="flex-1 flex flex-col gap-6">
          {[
            { id: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { id: 'Incidents', icon: <AlertCircle className="w-5 h-5" /> },
            { id: 'Live Markets', icon: <Activity className="w-5 h-5" /> },
            { id: 'Settings', icon: <Settings className="w-5 h-5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 hover-lift ${
                activeTab === tab.id 
                  ? 'bg-[#E8A14A]/10 text-[#E8A14A] shadow-inner' 
                  : 'text-[#F5E7D8]/40 hover:text-[#E8A14A] hover:bg-[#1C1715]'
              }`}
            >
              {activeTab === tab.id && <div className="absolute left-0 w-1 h-6 bg-[#E8A14A] rounded-r-full"></div>}
              {tab.icon}
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4 items-center">
           <div className="relative">
             <Cpu className="w-5 h-5 text-[#E8A14A] animate-pulse-glow" />
             <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_5px_#4ADE80]"></div>
           </div>
           <div className="w-10 h-10 rounded-full bg-[#1C1715] border border-[#E8A14A]/20 flex items-center justify-center hover-lift cursor-pointer overflow-hidden">
              <User className="w-5 h-5 text-[#F5E7D8]/60" />
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* TOP NAV */}
        <div className="h-16 border-b border-[#E8A14A]/10 flex items-center justify-between px-8 bg-[#151210]/60 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold tracking-wider text-[#F5E7D8] flex items-center gap-2">
              Mocha<span className="text-[#E8A14A]">Trade</span>
            </div>
            
            <div className="flex items-center gap-2 bg-[#1C1715] px-4 py-2 rounded-full border border-[#F5E7D8]/5 focus-within:border-[#E8A14A]/30 transition-colors">
              <Search className="w-4 h-4 text-[#F5E7D8]/40" />
              <input type="text" placeholder="Search markets..." className="bg-transparent border-none outline-none text-sm w-48 text-[#F5E7D8] placeholder-[#F5E7D8]/30" />
            </div>

            <div className="flex items-center gap-2 text-sm text-[#F5E7D8]/60 hover:text-[#F5E7D8] cursor-pointer">
              <span>NSE Equities</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live market indicator present globally as requested */}
            <div className="flex items-center gap-2 text-xs font-semibold bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-full border border-[#4ADE80]/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
               <div className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse"></div>
               LIVE MARKET
            </div>
            <button className="text-[#F5E7D8]/40 hover:text-[#E8A14A] transition-colors"><Bell className="w-5 h-5" /></button>
            <button className="text-[#F5E7D8]/40 hover:text-[#E8A14A] transition-colors"><Sun className="w-5 h-5" /></button>
          </div>
        </div>

        {/* TAB RENDERING */}
        {activeTab === 'Dashboard' && <DashboardTab />}
        {activeTab === 'Incidents' && <IncidentsTab />}
        {activeTab === 'Live Markets' && renderLiveMarketsTab()}
        {activeTab === 'Settings' && <SettingsTab />}
        {activeTab === 'Reports' && <div className="flex-1 p-8 text-center text-[#F5E7D8]/50 mt-10">Reports system is aggregating...</div>}
        
      </div>
    </div>
  );
}
