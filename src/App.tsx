import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Mail,
  MessageSquare,
  Monitor,
  Search,
  Bell,
  Play,
  Pause,
  Send,
  Settings,
  Smartphone,
  Terminal,
  TrendingUp,
  Share2,
  Users,
  AlertCircle
} from 'lucide-react';
import './index.css';

// --- Types ---
type DataPoint = {
  time: string;
  liquidations: number;
  tickets: number;
};

type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
  subtext?: string;
  type: 'INFO' | 'WARNING' | 'ACTION';
};

type CommunicationTemplate = {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
};

// --- Constants & Config ---
const TEMPLATES: CommunicationTemplate[] = [
  {
    id: 't1',
    title: 'Halt Trading Announcement',
    content: 'We are temporarily halting trading due to elevated volatility and unusual market conditions. Our team is actively monitoring the situation and will provide updates shortly. Thank you for your patience.',
    icon: <Share2 className="w-5 h-5 text-coral-600" />,
    color: 'border-[#FFD9C8] bg-[#FFD9C8]/40 text-orange-800'
  },
  {
    id: 't2',
    title: 'Support Delay Notice',
    content: 'Our support team is currently experiencing high volume. Wait times may be longer than usual. Please check our status page for immediate updates on platform stability.',
    icon: <Smartphone className="w-5 h-5 text-pink-600" />,
    color: 'border-[#F7B6C2] bg-[#F7B6C2]/40 text-pink-900'
  },
  {
    id: 't3',
    title: 'All Clear Notification',
    content: 'Market conditions have stabilized. We are resuming normal operations. All systems are operating nominally. Thank you for your patience.',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    color: 'border-[#D7F5E8] bg-[#D7F5E8]/60 text-emerald-800'
  }
];

const INITIAL_DATA: DataPoint[] = Array.from({ length: 20 }).map((_, i) => ({
  time: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString([], { hour12: false }),
  liquidations: Math.floor(Math.random() * 20) + 5,
  tickets: Math.floor(Math.random() * 30) + 15,
}));

function App() {
  // --- State ---
  const [data, setData] = useState<DataPoint[]>(INITIAL_DATA);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '10:18', message: 'Market volatility spiked to 14.7%', subtext: 'Detected by risk engine', type: 'INFO' },
    { id: '2', timestamp: '10:17', message: 'Liquidations exceeded threshold (18/min)', subtext: 'Auto-triggered alert to ops team', type: 'WARNING' },
    { id: '3', timestamp: '10:15', message: 'Margin trading paused', subtext: 'Manual action by risk lead', type: 'ACTION' },
    { id: '4', timestamp: '10:12', message: 'Incident comms draft created', subtext: 'Template: Halt Trading Announcement', type: 'INFO' },
    { id: '5', timestamp: '10:10', message: 'System load increased to 42%', subtext: 'Within normal range', type: 'INFO' },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(TEMPLATES[0]);
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    tickets: 32,
    liquidations: 18,
    volatility: 14.7,
    systemLoad: 42
  });

  const [activeStep] = useState(4); // 1-5 for the playbook
  const [activeTab, setActiveTab] = useState('Dashboard');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const addLog = (message: string, subtext: string, type: 'INFO' | 'WARNING' | 'ACTION' = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' });
    setLogs(prev => [{
      id: Math.random().toString(36).substring(7),
      timestamp,
      message,
      subtext,
      type
    }, ...prev]);
  };

  const sendCommunication = () => {
    if (selectedTemplate) {
      addLog(`Communication Sent: ${selectedTemplate.title}`, `Content broadcasted successfully`, 'ACTION');
    }
  };

  // --- Simulation Effect ---
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        const newLiq = Math.max(0, last.liquidations + (Math.random() * 20 - 5));
        const newTick = Math.max(0, last.tickets + (Math.random() * 30 - 10));
        
        setMetrics({
          tickets: Math.floor(newTick),
          liquidations: Math.floor(newLiq),
          volatility: +(Math.random() * 5 + 15).toFixed(1),
          systemLoad: Math.floor(Math.random() * 10 + 40)
        });

        const newDataPoint = {
          time: new Date().toLocaleTimeString([], { hour12: false }),
          liquidations: newLiq,
          tickets: newTick,
        };
        
        return [...prev.slice(1), newDataPoint];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-slate-800 font-sans flex h-screen overflow-hidden relative">
      
      {/* Organic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#FFD9C8] blur-[120px] opacity-40 mix-blend-multiply"></div>
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#E8DDFD] blur-[140px] opacity-40 mix-blend-multiply"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-[#D7F5E8] blur-[100px] opacity-40 mix-blend-multiply"></div>
      </div>

      {/* FLOATING SIDEBAR */}
      <div className="w-64 bg-white/60 backdrop-blur-xl border border-white/40 m-4 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col pt-6 pb-6 shrink-0 z-10 relative">
        <div className="flex items-center gap-3 px-6 mb-10">
          <div className="bg-gradient-to-br from-[#FFD9C8] to-[#F7B6C2] p-2 rounded-xl shadow-sm">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">MochaTrade</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'Dashboard', icon: <Monitor className="w-4 h-4" />, color: 'bg-[#D7F5E8] text-emerald-700' },
            { id: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-[#FFE8A3] text-amber-700' },
            { id: 'Reports', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-[#E8DDFD] text-purple-700' },
            { id: 'Live Markets', icon: <Activity className="w-4 h-4" />, color: 'bg-[#F7B6C2] text-pink-700' },
            { id: 'Settings', icon: <Settings className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', isBottom: true }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white border border-white/60 text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40 border border-transparent'
              } ${tab.isBottom ? 'mt-auto' : ''}`}
            >
              <div className={`p-1.5 rounded-lg ${tab.color}`}>
                {tab.icon}
              </div>
              {tab.id}
            </button>
          ))}
        </nav>

        {/* Sidebar Bottom Banner */}
        <div className="mt-8 mx-4 p-5 rounded-2xl bg-gradient-to-br from-[#E8DDFD]/30 to-[#D7F5E8]/30 border border-white/50 text-center relative overflow-hidden h-40 flex flex-col justify-start pt-6">
          <svg className="absolute bottom-0 left-0 w-full h-24 opacity-80 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 L0,50 Q25,30 50,60 T100,40 L100,100 Z" fill="#FFE8A3" />
            <path d="M0,100 L0,70 Q35,50 65,75 T100,55 L100,100 Z" fill="#FFD9C8" />
            <path d="M0,100 L0,85 Q45,70 75,90 T100,75 L100,100 Z" fill="#F7B6C2" />
          </svg>
          <div className="relative z-10">
            <div className="text-sm font-bold text-slate-700 mb-1">MochaTrade</div>
            <div className="text-xs text-slate-500 font-medium leading-tight">Better systems.<br/>Smoother trades.</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 pt-4 pr-4 pb-4">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex items-center justify-between px-6 shrink-0 mb-6 relative overflow-hidden">
          {/* Header Mountains */}
          <svg className="absolute bottom-0 right-0 w-[400px] h-full opacity-70 pointer-events-none z-0" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path d="M0,100 L40,30 Q80,10 120,50 T200,20 L200,100 Z" fill="#FFE8A3" />
            <path d="M20,100 L80,50 Q110,30 150,60 T200,40 L200,100 Z" fill="#FFD9C8" />
            <path d="M60,100 L120,70 Q160,50 200,75 L200,100 Z" fill="#F7B6C2" />
          </svg>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input type="text" placeholder="Search operations..." className="bg-white/50 border border-slate-200/50 rounded-full pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD9C8] w-64 placeholder:text-slate-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-[#D7F5E8]/50 px-3 py-1.5 rounded-full border border-white/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-800 font-bold text-xs tracking-wide">System Healthy</span>
            </div>
            <div className="flex items-center gap-2 bg-[#D7F5E8]/50 px-3 py-1.5 rounded-full border border-white/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-800 font-bold text-xs tracking-wide">Market Normal</span>
            </div>
            <div className="flex items-center gap-2 bg-[#FFE8A3]/50 px-3 py-1.5 rounded-full border border-white/50">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-amber-800 font-bold text-xs tracking-wide">Incident Monitoring</span>
            </div>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <div className="text-right flex flex-col">
              <span className="font-bold text-slate-700">10:20 AM</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apr 24, 2026</span>
            </div>
            
            <button className="relative p-2 bg-white rounded-full border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F7B6C2] rounded-full border border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E8DDFD] to-[#FFD9C8] border-2 border-white shadow-sm"></div>
          </div>
        </header>

        {/* DASHBOARD SCROLL AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2">
          
          {activeTab !== 'Dashboard' ? (
            <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{activeTab}</h2>
              <p className="text-slate-500 font-medium">This module is currently under construction for the Round 2 prototype.</p>
            </div>
          ) : (
            <>
              {/* Greeting Section */}
              <div className="flex gap-6 items-stretch">
            <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">👋 Good Morning, Trader</h2>
              <p className="text-slate-500 font-medium">Here's what's happening with your operations today.</p>
              
              <div className="mt-6 flex gap-4">
                <button 
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFD9C8] to-[#F7B6C2] hover:opacity-90 text-slate-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-orange-600" />}
                  {isSimulating ? 'Pause Scenario' : 'Run Flash-Crash Scenario'}
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D7F5E8] rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-[#D7F5E8]/60 rounded-2xl text-emerald-700"><MessageSquare className="w-5 h-5"/></div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-white px-2 py-1 rounded-full shadow-sm"><TrendingUp className="w-3 h-3"/> 12%</span>
              </div>
              <div className="text-3xl font-bold text-slate-800 relative z-10">{metrics.tickets}</div>
              <div className="text-sm font-semibold text-slate-500 mt-1 relative z-10">Tickets / Minute</div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#F7B6C2] rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-[#F7B6C2]/60 rounded-2xl text-pink-700"><TrendingUp className="w-5 h-5"/></div>
                <span className="flex items-center gap-1 text-xs font-bold text-pink-600 bg-white px-2 py-1 rounded-full shadow-sm"><TrendingUp className="w-3 h-3"/> 28%</span>
              </div>
              <div className="text-3xl font-bold text-slate-800 relative z-10">{metrics.liquidations}</div>
              <div className="text-sm font-semibold text-slate-500 mt-1 relative z-10">Liquidations / Minute</div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FFE8A3] rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-[#FFE8A3]/60 rounded-2xl text-amber-700"><Activity className="w-5 h-5"/></div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-white px-2 py-1 rounded-full shadow-sm"><TrendingUp className="w-3 h-3"/> 6%</span>
              </div>
              <div className="text-3xl font-bold text-slate-800 relative z-10">{metrics.volatility}%</div>
              <div className="text-sm font-semibold text-slate-500 mt-1 relative z-10">Volatility</div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#E8DDFD] rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-[#E8DDFD]/60 rounded-2xl text-purple-700"><Terminal className="w-5 h-5"/></div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-white px-2 py-1 rounded-full shadow-sm"><TrendingUp className="w-3 h-3 transform rotate-180"/> 8%</span>
              </div>
              <div className="text-3xl font-bold text-slate-800 relative z-10">{metrics.systemLoad}%</div>
              <div className="text-sm font-semibold text-slate-500 mt-1 relative z-10">System Load</div>
            </div>
          </div>

          <div className="flex gap-6">
            
            {/* Center Main Area */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              
              {/* Live Market Activity Chart */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col h-[400px]">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      Live Market Activity
                      <span className="flex items-center gap-1.5 text-xs px-3 py-1 bg-white border border-slate-100 shadow-sm text-emerald-600 rounded-full font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        LIVE
                      </span>
                    </h2>
                    <div className="text-sm font-medium text-slate-500 mt-1">Real-time incident signals</div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FFD9C8] rounded-full border border-orange-200"></div> Tickets
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FFE8A3] rounded-full border border-amber-200"></div> Liquidations
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD9C8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFD9C8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLiq" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFE8A3" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFE8A3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} axisLine={false} tickLine={false} tickCount={5} domain={[0, 60]} />
                      <YAxis yAxisId="right" orientation="right" stroke="#cbd5e1" fontSize={11} axisLine={false} tickLine={false} tickCount={5} domain={[0, 24]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                        itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                        labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
                      />
                      
                      <Area yAxisId="left" type="monotone" dataKey="liquidations" name="Liquidations/min" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorLiq)" activeDot={{ r: 6, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
                      <Area yAxisId="right" type="monotone" dataKey="tickets" name="Tickets/min" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Row inside Center */}
              <div className="flex gap-6">
                
                {/* Playbook */}
                <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col h-[350px]">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500"/>
                    Response Protocol
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">5-step incident workflow</p>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {[
                      { step: 1, title: 'Assess Volatility', desc: 'Check market conditions' },
                      { step: 2, title: 'Notify Management', desc: 'Alert leadership teams' },
                      { step: 3, title: 'Halt Margin', desc: 'Pause margin trading' },
                      { step: 4, title: 'Draft Comms', desc: 'Prepare customer notices' },
                      { step: 5, title: 'Resume Normal', desc: 'Restore trading' },
                    ].map((s) => {
                      let status = 'Pending';
                      let statusStyle = 'bg-slate-100 text-slate-500';
                      let iconStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                      
                      if (s.step < activeStep) {
                        status = 'Completed';
                        statusStyle = 'bg-[#D7F5E8] text-emerald-800';
                        iconStyle = 'bg-[#D7F5E8] text-emerald-600 border-[#D7F5E8]';
                      } else if (s.step === activeStep) {
                        status = 'In Progress';
                        statusStyle = 'bg-[#FFE8A3] text-amber-800';
                        iconStyle = 'bg-[#FFE8A3] text-amber-600 border-[#FFE8A3] shadow-sm';
                      }

                      return (
                        <div key={s.step} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-white/60 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${iconStyle}`}>
                              {s.step < activeStep ? <CheckCircle2 className="w-4 h-4"/> : s.step}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-700">{s.title}</div>
                              <div className="text-xs font-medium text-slate-500">{s.desc}</div>
                            </div>
                          </div>
                          <div className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 ${statusStyle}`}>
                            {status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {status}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Log */}
                <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col h-[350px]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-slate-400"/>
                        Ops Decision Log
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Live Activity Feed</p>
                    </div>
                    <button className="text-xs text-slate-500 hover:text-slate-800 font-bold bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 transition-colors">View All &rarr;</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
                    {logs.map((log, index) => (
                      <div key={log.id} className="flex gap-4 relative">
                        {index !== logs.length - 1 && <div className="absolute left-[15px] top-[24px] bottom-[-20px] w-0.5 bg-slate-100"></div>}
                        <div className="relative z-10 shrink-0 mt-1">
                          {log.type === 'INFO' && <div className="w-8 h-8 rounded-full bg-[#E8DDFD] border-4 border-white flex items-center justify-center"></div>}
                          {log.type === 'WARNING' && <div className="w-8 h-8 rounded-full bg-[#FFE8A3] border-4 border-white flex items-center justify-center"></div>}
                          {log.type === 'ACTION' && <div className="w-8 h-8 rounded-full bg-[#D7F5E8] border-4 border-white flex items-center justify-center"></div>}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-700">{log.message}</span>
                            <span className="text-xs font-bold text-slate-400 font-mono ml-auto">{log.timestamp}</span>
                          </div>
                          {log.subtext && <div className="text-xs font-medium text-slate-500">{log.subtext}</div>}
                        </div>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SIDEBAR - Comms */}
            <div className="w-[380px] shrink-0 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col h-[774px]">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-coral-500" />
                Incident Communication
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-6">Pre-approved templates for rapid deployment.</p>

              {/* Templates */}
              <div className="space-y-3 mb-8">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedTemplate?.id === t.id 
                        ? 'bg-white border-[#FFD9C8] shadow-md scale-[1.02]' 
                        : 'bg-white/50 border-white hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl border ${t.color}`}>
                        {t.icon}
                      </div>
                      <span className="text-sm font-bold text-slate-700 flex-1">{t.title}</span>
                      <ChevronRight className={`w-5 h-5 ${selectedTemplate?.id === t.id ? 'text-coral-400' : 'text-slate-300'}`} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Draft Section */}
              <div className="flex-1 flex flex-col border border-white rounded-2xl bg-white/80 shadow-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD9C8]/40 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2 text-slate-700 text-sm font-bold">
                    <MessageSquare className="w-4 h-4"/>
                    Message Preview
                  </div>
                  <button className="text-xs font-bold text-coral-600 bg-[#FFD9C8]/40 px-3 py-1 rounded-full hover:bg-[#FFD9C8]/60 transition-colors">
                    Edit
                  </button>
                </div>
                
                <div className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-6 relative z-10">
                  {selectedTemplate?.content || "Select a template above..."}
                </div>

                <div className="mb-5 relative z-10">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Audience</div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold shadow-sm"><Users className="w-3.5 h-3.5"/> All Users</span>
                    <span className="text-xs bg-white text-slate-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold border border-slate-200"><Users className="w-3.5 h-3.5"/> Internal</span>
                  </div>
                </div>
                
                <div className="mb-8 relative z-10">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Channel</div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold shadow-sm"><Share2 className="w-3.5 h-3.5"/> Twitter/X</span>
                    <span className="text-xs bg-white text-slate-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold border border-slate-200"><Smartphone className="w-3.5 h-3.5"/> In-App</span>
                    <span className="text-xs bg-white text-slate-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold border border-slate-200"><Mail className="w-3.5 h-3.5"/> Email</span>
                  </div>
                </div>

                <button
                  onClick={sendCommunication}
                  disabled={!selectedTemplate}
                  className="w-full mt-auto py-3.5 bg-gradient-to-r from-[#FFD9C8] to-[#F7B6C2] hover:opacity-90 disabled:opacity-50 text-slate-800 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm relative z-10"
                >
                  <Send className="w-4 h-4 text-orange-600" />
                  Dispatch Communication
                </button>
              </div>

            </div>
          </div>
          
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
