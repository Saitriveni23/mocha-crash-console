import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity, AlertTriangle, CheckCircle2, ChevronRight, Bell, Play, Pause, Send,
  Settings, Smartphone, Terminal, TrendingUp, Share2, Users, AlertCircle, Monitor,
  Search, MessageSquare, Hash, FileText, Printer, Download, User, Moon, Sun, Shield,
  ArrowUpRight, ArrowDownRight, Target, BellRing, Eye
} from 'lucide-react';
import './index.css';

// --- Types ---
type DataPoint = { time: string; liquidations: number; tickets: number; };
type LogEntry = { id: string; timestamp: string; message: string; subtext?: string; type: 'INFO' | 'WARNING' | 'ACTION'; };
type ChatMessage = { id: string; sender: string; avatar: string; text: string; time: string; role: string; };
type Tweet = { id: string; handle: string; text: string; sentiment: 'negative' | 'neutral' | 'panic'; time: string; };
type CommunicationTemplate = { id: string; title: string; content: string; icon: React.ReactNode; color: string; };
type MarketAsset = { symbol: string; name: string; price: number; change24h: number; volume: string; status: 'Normal' | 'Volatile' | 'Halted' };
type UserAlert = { id: string; timestamp: string; message: string; type: 'WARNING' | 'CRITICAL'; price: number; threshold: number; asset: string };

const TEMPLATES: CommunicationTemplate[] = [
  { id: 't1', title: 'Halt Trading Announcement', content: 'We are temporarily halting trading due to elevated volatility and unusual market conditions. Our team is actively monitoring the situation and will provide updates shortly. Thank you for your patience.', icon: <Share2 className="w-5 h-5 text-coral-600" />, color: 'border-[#FFD9C8] bg-[#FFD9C8]/40 text-orange-800' },
  { id: 't2', title: 'Support Delay Notice', content: 'Our support team is currently experiencing high volume. Wait times may be longer than usual. Please check our status page for immediate updates on platform stability.', icon: <Smartphone className="w-5 h-5 text-pink-600" />, color: 'border-[#F7B6C2] bg-[#F7B6C2]/40 text-pink-900' },
  { id: 't3', title: 'All Clear Notification', content: 'Market conditions have stabilized. We are resuming normal operations. All systems are operating nominally. Thank you for your patience.', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, color: 'border-[#D7F5E8] bg-[#D7F5E8]/60 text-emerald-800' }
];

const INITIAL_DATA: DataPoint[] = Array.from({ length: 20 }).map((_, i) => ({
  time: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString([], { hour12: false }),
  liquidations: Math.floor(Math.random() * 20) + 5,
  tickets: Math.floor(Math.random() * 30) + 15,
}));

const INITIAL_MARKETS: MarketAsset[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 64230.50, change24h: -4.2, volume: '$1.2B', status: 'Volatile' },
  { symbol: 'ETH-USD', name: 'Ethereum', price: 3450.20, change24h: -5.8, volume: '$840M', status: 'Volatile' },
  { symbol: 'SOL-USD', name: 'Solana', price: 142.80, change24h: -8.4, volume: '$420M', status: 'Halted' },
  { symbol: 'AVAX-USD', name: 'Avalanche', price: 35.40, change24h: -2.1, volume: '$120M', status: 'Normal' },
  { symbol: 'LINK-USD', name: 'Chainlink', price: 18.20, change24h: 1.2, volume: '$95M', status: 'Normal' },
];

const PAST_INCIDENTS = [
  { id: 'INC-9042', date: 'Apr 24, 2026', title: 'Flash Crash Cascade (SOL)', severity: 'Critical', status: 'Investigating', duration: 'Ongoing' },
  { id: 'INC-8931', date: 'Mar 12, 2026', title: 'API Gateway Timeout', severity: 'High', status: 'Resolved', duration: '45 mins' },
  { id: 'INC-8720', date: 'Feb 28, 2026', title: 'Matching Engine Latency', severity: 'Medium', status: 'Resolved', duration: '12 mins' },
  { id: 'INC-8105', date: 'Jan 15, 2026', title: 'Provider Price Feed Sync Error', severity: 'Low', status: 'Resolved', duration: '5 mins' },
];

function App() {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState('Market Monitor'); // Defaulting to the new tab for visibility
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep] = useState(4); // Playbook step
  const [showNotifications, setShowNotifications] = useState(false);
  const [themeMode, setThemeMode] = useState<'light'|'dark'>('light');

  // --- Dashboard Data State ---
  const [data, setData] = useState<DataPoint[]>(INITIAL_DATA);
  const [metrics, setMetrics] = useState({ tickets: 32, liquidations: 18, volatility: 14.7, systemLoad: 42 });
  const [maxMetrics, setMaxMetrics] = useState({ tickets: 32, liquidations: 18, volatility: 14.7 });
  const [markets, setMarkets] = useState<MarketAsset[]>(INITIAL_MARKETS);
  
  // --- TCS Market Monitor State (New Feature) ---
  const [tcsPrice, setTcsPrice] = useState(3120);
  const [tcsVolume, setTcsVolume] = useState(12400);
  const [tcsThreshold] = useState(3000);
  const [userAlerts, setUserAlerts] = useState<UserAlert[]>([]);
  const [hasTriggeredWarning, setHasTriggeredWarning] = useState(false);
  const [hasTriggeredCritical, setHasTriggeredCritical] = useState(false);

  // --- Interactive Panels State ---
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState(TEMPLATES[0].content);
  const [bottomRightView, setBottomRightView] = useState<'log' | 'chat' | 'social'>('log');

  // --- Feeds State ---
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '10:18', message: 'Market volatility spiked to 14.7%', subtext: 'Detected by risk engine', type: 'INFO' },
    { id: '2', timestamp: '10:17', message: 'Liquidations exceeded threshold (18/min)', subtext: 'Auto-triggered alert to ops team', type: 'WARNING' },
    { id: '3', timestamp: '10:15', message: 'Margin trading paused', subtext: 'Manual action by risk lead', type: 'ACTION' },
  ]);
  
  const [teamChat, setTeamChat] = useState<ChatMessage[]>([
    { id: 'c1', sender: 'Sarah J.', avatar: 'bg-emerald-200 text-emerald-700', role: 'Risk Lead', text: 'I am seeing abnormal liquidation cascades on the BTC/USD pair. Stopping margin buys.', time: '10:15' },
    { id: 'c2', sender: 'Marcus T.', avatar: 'bg-purple-200 text-purple-700', role: 'CTO', text: 'Matching engine is holding up, but API gateways are saturated with retry requests.', time: '10:16' },
  ]);

  const [tweets, setTweets] = useState<Tweet[]>([
    { id: 'tw1', handle: '@CryptoKing99', text: 'Did MochaTrade just freeze my orders?! Cant close my longs!! #flashcrash', sentiment: 'panic', time: '10:17' },
    { id: 'tw2', handle: '@TradeAnon', text: 'Looks like the whole market is dumping, not just Mocha.', sentiment: 'neutral', time: '10:18' },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync custom message when template changes
  useEffect(() => {
    if (selectedTemplate) setCustomMessage(selectedTemplate.content);
  }, [selectedTemplate]);

  // Auto-scroll feeds
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs, teamChat, tweets, bottomRightView, userAlerts]);

  // --- Handlers ---
  const addLog = (message: string, subtext: string, type: 'INFO' | 'WARNING' | 'ACTION' = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' });
    setLogs(prev => [...prev, { id: Math.random().toString(36).substring(7), timestamp, message, subtext, type }]);
  };

  const addUserAlert = (message: string, type: 'WARNING' | 'CRITICAL', price: number) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' });
    setUserAlerts(prev => [{ id: Math.random().toString(36).substring(7), timestamp, message, type, price, threshold: tcsThreshold, asset: 'TCS' }, ...prev]);
    // Also push to platform logs to show Layer 1 to Layer 2 connection
    addLog(`User Alert Triggered: TCS ${type === 'CRITICAL' ? 'Crossed' : 'Approaching'} Threshold`, `Price: ₹${price}`, type);
  };

  const sendCommunication = () => {
    if (selectedTemplate) {
      addLog(`Communication Sent: ${selectedTemplate.title}`, `Content: "${customMessage.substring(0, 30)}..."`, 'ACTION');
      setTweets(prev => [...prev, { id: Math.random().toString(), handle: '@MochaTradeOps', text: customMessage, sentiment: 'neutral', time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' }) }]);
    }
  };

  // --- Simulation Loop ---
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' });
      
      // Update Dashboard Metrics (Dramatic Spikes)
      setData(prev => {
        const last = prev[prev.length - 1];
        const newLiq = Math.max(0, last.liquidations + (Math.random() * 40 - 10)); // Higher spike volatility
        const newTick = Math.max(0, last.tickets + (Math.random() * 60 - 15));
        const newVol = +(Math.random() * 15 + 20).toFixed(1); // Higher baseline volatility
        
        setMetrics({ tickets: Math.floor(newTick), liquidations: Math.floor(newLiq), volatility: newVol, systemLoad: Math.floor(Math.random() * 20 + 70) });
        setMaxMetrics(m => ({
          tickets: Math.max(m.tickets, Math.floor(newTick)),
          liquidations: Math.max(m.liquidations, Math.floor(newLiq)),
          volatility: Math.max(m.volatility, newVol)
        }));

        return [...prev.slice(1), { time: new Date().toLocaleTimeString([], { hour12: false }), liquidations: newLiq, tickets: newTick }];
      });

      // Update TCS Market Feed (Simulate Crash)
      setTcsPrice(prev => {
        const drop = Math.floor(Math.random() * 40) + 10;
        const newPrice = prev - drop;
        
        // Threshold Engine Logic
        if (newPrice <= 3025 && newPrice > 3000 && !hasTriggeredWarning) {
          addUserAlert('TCS approaching threshold (₹3,000)', 'WARNING', newPrice);
          setHasTriggeredWarning(true);
        } else if (newPrice < 3000 && !hasTriggeredCritical) {
          addUserAlert('TCS crossed below your configured threshold', 'CRITICAL', newPrice);
          setHasTriggeredCritical(true);
        }
        
        return newPrice;
      });
      setTcsVolume(prev => prev + Math.floor(Math.random() * 8000) + 2000);

      // Randomly inject Team Chat
      if (Math.random() > 0.7) {
        const messages = [
          "Customer support queue just crossed 500 tickets.",
          "Database write latency is spiking, but no dropped ACKs yet.",
          "Should we prepare the 'All Clear' or wait out this candle?",
          "Risk engine confirms margin buffers are holding."
        ];
        setTeamChat(prev => [...prev, { id: Math.random().toString(), sender: 'Marcus T.', avatar: 'bg-purple-200 text-purple-700', role: 'CTO', text: messages[Math.floor(Math.random() * messages.length)], time: now }]);
      }

    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, hasTriggeredWarning, hasTriggeredCritical]);

  return (
    <div className={`min-h-screen ${themeMode === 'light' ? 'bg-[#FFF8F3] text-slate-800' : 'bg-[#1e1b1a] text-slate-100'} font-sans flex h-screen overflow-hidden relative transition-colors duration-500`}>
      
      {/* Organic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full ${themeMode === 'light' ? 'bg-[#FFD9C8] opacity-40 mix-blend-multiply' : 'bg-[#ff9466] opacity-10 blur-[150px]'} blur-[120px] transition-all duration-500`}></div>
        <div className={`absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full ${themeMode === 'light' ? 'bg-[#E8DDFD] opacity-40 mix-blend-multiply' : 'bg-[#b794f6] opacity-10 blur-[150px]'} blur-[140px] transition-all duration-500`}></div>
        <div className={`absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full ${themeMode === 'light' ? 'bg-[#D7F5E8] opacity-40 mix-blend-multiply' : 'bg-[#76e4b4] opacity-10 blur-[150px]'} blur-[100px] transition-all duration-500`}></div>
      </div>

      {/* FLOATING SIDEBAR */}
      <div className={`w-64 ${themeMode === 'light' ? 'bg-white/60 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.02)]' : 'bg-[#2a2625]/60 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'} backdrop-blur-xl border m-4 rounded-[28px] flex flex-col pt-6 pb-6 shrink-0 z-10 relative transition-colors duration-500`}>
        <div className="flex items-center gap-3 px-6 mb-10">
          <div className="bg-gradient-to-br from-[#FFD9C8] to-[#F7B6C2] p-2 rounded-xl shadow-sm">
            <Activity className="text-orange-900 w-6 h-6" />
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${themeMode === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>MochaTrade</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'Market Monitor', icon: <Target className="w-4 h-4" />, color: 'bg-[#FFD9C8] text-orange-700' },
            { id: 'Dashboard', icon: <Monitor className="w-4 h-4" />, color: 'bg-[#D7F5E8] text-emerald-700' },
            { id: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-[#FFE8A3] text-amber-700' },
            { id: 'Reports', icon: <FileText className="w-4 h-4" />, color: 'bg-[#E8DDFD] text-purple-700' },
            { id: 'Settings', icon: <Settings className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', isBottom: true }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === tab.id
                  ? (themeMode === 'light' ? 'bg-white border border-white/60 text-slate-800 shadow-sm' : 'bg-[#3b3634] border border-white/10 text-white shadow-sm')
                  : (themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40 border border-transparent' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent')
              } ${tab.isBottom ? 'mt-auto' : ''}`}
            >
              <div className={`p-1.5 rounded-lg ${tab.color}`}>
                {tab.icon}
              </div>
              {tab.id}
            </button>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 pt-4 pr-4 pb-4">
        
        {/* TOP HEADER */}
        <header className={`h-20 ${themeMode === 'light' ? 'bg-white/60 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.02)]' : 'bg-[#2a2625]/60 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'} backdrop-blur-xl border rounded-[28px] flex items-center justify-between px-6 shrink-0 mb-6 relative overflow-visible z-50 transition-colors duration-500`}>
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input type="text" placeholder="Search operations..." className={`${themeMode === 'light' ? 'bg-white/50 border-slate-200/50 text-slate-800' : 'bg-[#1e1b1a]/50 border-white/10 text-white'} border rounded-full pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD9C8] w-64 placeholder:text-slate-400`} />
            </div>
            
            {/* Global Simulation Toggle */}
            <button 
              onClick={() => setIsSimulating(!isSimulating)}
              className={`ml-4 px-4 py-2 ${isSimulating ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200' : 'bg-white text-emerald-600 hover:bg-slate-50 border-emerald-200'} border rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm`}
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-600" />}
              {isSimulating ? 'PAUSE CRASH SIMULATION' : 'RUN CRASH SIMULATION'}
            </button>
          </div>
          
          <div className="flex items-center gap-6 text-sm relative z-10">
            <div className={`flex items-center gap-2 ${themeMode === 'light' ? 'bg-[#D7F5E8]/50 border-white/50' : 'bg-[#D7F5E8]/10 border-white/10'} px-3 py-1.5 rounded-full border`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className={`font-bold text-xs tracking-wide ${themeMode === 'light' ? 'text-emerald-800' : 'text-emerald-400'}`}>System Healthy</span>
            </div>
            <div className={`flex items-center gap-2 ${themeMode === 'light' ? 'bg-[#FFE8A3]/50 border-white/50' : 'bg-[#FFE8A3]/10 border-white/10'} px-3 py-1.5 rounded-full border`}>
              <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className={`font-bold text-xs tracking-wide ${themeMode === 'light' ? 'text-amber-800' : 'text-amber-400'}`}>{isSimulating ? 'Incident Monitoring' : 'No Incidents'}</span>
            </div>
            
            <div className="w-px h-6 bg-slate-200/20 mx-2"></div>
            
            <div className="text-right flex flex-col">
              <span className={`font-bold ${themeMode === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{new Date().toLocaleTimeString([], { hour12: true, hour: '2-digit', minute:'2-digit' })}</span>
            </div>
            
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 ${themeMode === 'light' ? 'bg-white border-slate-100 hover:text-slate-600' : 'bg-[#3b3634] border-white/10 hover:text-white'} rounded-full border shadow-sm text-slate-400 transition-colors`}>
                <Bell className="w-5 h-5" />
                {(userAlerts.length > 0 || isSimulating) && <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full border border-white"></span>}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className={`absolute top-full right-0 mt-3 w-80 ${themeMode === 'light' ? 'bg-white border-slate-100' : 'bg-[#2a2625] border-white/10'} border rounded-2xl shadow-xl overflow-hidden`}>
                  <div className={`p-4 border-b ${themeMode === 'light' ? 'border-slate-100' : 'border-white/10'} flex justify-between items-center`}>
                    <h4 className="font-bold text-sm">Recent Alerts</h4>
                    <span className="text-xs text-blue-500 font-bold cursor-pointer">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {userAlerts.slice(0, 3).map(alert => (
                      <div key={alert.id} className={`p-4 border-b ${themeMode === 'light' ? 'border-slate-50 hover:bg-slate-50' : 'border-white/5 hover:bg-white/5'} transition-colors cursor-pointer`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold ${alert.type === 'CRITICAL' ? 'text-pink-500' : 'text-amber-500'}`}>USER {alert.type}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                        </div>
                        <p className="text-sm font-semibold">{alert.message}</p>
                      </div>
                    ))}
                    {logs.filter(l => l.type === 'WARNING' || l.type === 'ACTION').slice(-3).reverse().map(log => (
                      <div key={log.id} className={`p-4 border-b ${themeMode === 'light' ? 'border-slate-50 hover:bg-slate-50' : 'border-white/5 hover:bg-white/5'} transition-colors cursor-pointer`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold ${log.type === 'ACTION' ? 'text-emerald-500' : 'text-amber-500'}`}>PLATFORM {log.type}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-sm font-semibold">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Main View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2 z-10">
          
          {activeTab === 'Market Monitor' ? (

            /* --- NEW MARKET MONITOR & ALERTS VIEW --- */
            <div className="flex-1 flex flex-col gap-6">
              <div className={`flex justify-between items-end ${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-8 shadow-sm`}>
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Target className="w-8 h-8 text-orange-500" /> Market Monitor & Personal Alerts
                  </h2>
                  <p className="text-slate-500 font-medium">Layer 1 Individual Protection integrated with Layer 2 Platform Incident Monitoring.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                
                {/* Left Col: Asset Overview */}
                <div className={`col-span-1 ${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm flex flex-col`}>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Selected Asset</div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-bold">TCS</h3>
                      <div className="text-sm font-semibold text-slate-500">Tata Consultancy Services</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold font-mono">₹{tcsPrice.toLocaleString()}</div>
                      <div className={`text-sm font-bold flex items-center justify-end gap-1 ${tcsPrice < 3120 ? 'text-pink-500' : 'text-slate-500'}`}>
                        {tcsPrice < 3120 ? <ArrowDownRight className="w-4 h-4"/> : null}
                        {tcsPrice < 3120 ? '-'+(((3120 - tcsPrice)/3120)*100).toFixed(1)+'%' : '0.0%'}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${themeMode === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-[#1e1b1a] border-white/10'} border mb-6`}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">Trading Volume</span>
                      <span className="text-sm font-bold">{tcsVolume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400">Reference Price</span>
                      <span className="text-sm font-bold">₹3,120</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Alert Rules</div>
                    <div className={`p-4 rounded-xl border ${themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-[#2a2625] border-white/20'} shadow-sm flex items-center justify-between`}>
                      <div>
                        <div className="text-xs font-bold text-slate-500">Lower Threshold</div>
                        <div className="font-bold">₹{tcsThreshold.toLocaleString()}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${tcsPrice < tcsThreshold ? 'bg-[#F7B6C2]/40 text-pink-800' : 'bg-[#D7F5E8]/40 text-emerald-800'}`}>
                        {tcsPrice < tcsThreshold ? 'Triggered' : 'Active'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Alerts & Incident Status */}
                <div className="col-span-2 flex flex-col gap-6">
                  
                  {/* Real-Time Alerts Panel */}
                  <div className={`flex-1 ${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm`}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <BellRing className="w-4 h-4"/> Real-Time User Alerts (Layer 1)
                    </div>

                    {userAlerts.length === 0 ? (
                      <div className={`flex flex-col items-center justify-center h-40 rounded-2xl border border-dashed ${themeMode === 'light' ? 'border-slate-300 bg-white/50' : 'border-white/20 bg-white/5'}`}>
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2"/>
                        <span className="text-sm font-bold text-slate-500">No active alerts. Monitoring your thresholds.</span>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {userAlerts.map(alert => (
                          <div key={alert.id} className={`p-5 rounded-2xl border shadow-sm ${
                            alert.type === 'CRITICAL' ? 'bg-pink-50 border-pink-200 text-slate-800' : 'bg-amber-50 border-amber-200 text-slate-800'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 font-bold">
                                {alert.type === 'CRITICAL' ? <AlertCircle className="w-5 h-5 text-pink-600"/> : <AlertTriangle className="w-5 h-5 text-amber-600"/>}
                                {alert.type === 'CRITICAL' ? 'PRICE ALERT TRIGGERED' : 'APPROACHING THRESHOLD'}
                              </div>
                              <div className="text-xs font-bold font-mono opacity-60">{alert.timestamp}</div>
                            </div>
                            <p className="font-medium text-sm mb-4">{alert.message}</p>
                            <div className="flex items-center gap-4 text-xs font-bold">
                              <div>Current: ₹{alert.price.toLocaleString()}</div>
                              <div>Target: ₹{alert.threshold.toLocaleString()}</div>
                            </div>
                            <div className="flex gap-3 mt-4 pt-4 border-t border-black/10">
                              <button className="px-4 py-1.5 bg-white/80 hover:bg-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"><Eye className="w-3 h-3"/> View Market Data</button>
                              <button className="px-4 py-1.5 bg-transparent border border-black/10 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors">Dismiss</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Platform Incident Context */}
                  <div className={`flex-1 ${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm`}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Shield className="w-4 h-4"/> Platform Incident Context (Layer 2)
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-bold mb-3">System Anomaly Detection</div>
                        <ul className="space-y-2 text-xs font-medium">
                          <li className={`flex items-center gap-2 ${maxMetrics.liquidations > 25 ? 'text-pink-500' : 'text-slate-500'}`}>
                            {maxMetrics.liquidations > 25 ? <AlertCircle className="w-3 h-3"/> : <CheckCircle2 className="w-3 h-3 text-emerald-500"/>} 
                            Liquidations Spiking ({maxMetrics.liquidations})
                          </li>
                          <li className={`flex items-center gap-2 ${maxMetrics.volatility > 20 ? 'text-amber-500' : 'text-slate-500'}`}>
                            {maxMetrics.volatility > 20 ? <AlertTriangle className="w-3 h-3"/> : <CheckCircle2 className="w-3 h-3 text-emerald-500"/>} 
                            High Volatility ({maxMetrics.volatility}%)
                          </li>
                          <li className={`flex items-center gap-2 ${maxMetrics.tickets > 50 ? 'text-amber-500' : 'text-slate-500'}`}>
                            {maxMetrics.tickets > 50 ? <AlertTriangle className="w-3 h-3"/> : <CheckCircle2 className="w-3 h-3 text-emerald-500"/>} 
                            Support Queue Spiking ({maxMetrics.tickets})
                          </li>
                        </ul>
                      </div>
                      <div className={`p-4 rounded-2xl ${themeMode === 'light' ? 'bg-white border-slate-100' : 'bg-[#1e1b1a] border-white/5'} border`}>
                        <div className="text-sm font-bold mb-2">Ops Incident Response</div>
                        <div className="space-y-1.5 text-xs font-bold">
                          <div className={`flex justify-between p-1.5 rounded ${activeStep > 1 ? 'bg-[#D7F5E8]/40 text-emerald-700' : ''}`}><span>DETECT</span> {activeStep > 1 && '✓'}</div>
                          <div className={`flex justify-between p-1.5 rounded ${activeStep > 2 ? 'bg-[#D7F5E8]/40 text-emerald-700' : ''}`}><span>CONTAIN</span> {activeStep > 2 && '✓'}</div>
                          <div className={`flex justify-between p-1.5 rounded ${activeStep === 3 ? 'bg-[#FFE8A3]/40 text-amber-700' : ''}`}><span>VERIFY</span> {activeStep === 3 && 'PENDING'}</div>
                          <div className="flex justify-between p-1.5 rounded text-slate-400"><span>RESOLVE</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          ) : activeTab === 'Dashboard' ? (
            
            /* --- EXISTING DASHBOARD VIEW (Truncated here for brevity but kept in actual implementation) --- */
            <>
              {/* Greeting Section */}
              <div className="flex gap-6 items-stretch">
                <div className={`flex-1 ${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-8 shadow-sm flex flex-col justify-center relative overflow-hidden transition-colors duration-500`}>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">👋 Good Morning, Trader</h2>
                    <p className="text-slate-500 font-medium">Here's what's happening with your operations today.</p>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-6">
                <div className={`${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm relative overflow-hidden group`}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D7F5E8] rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-[#D7F5E8]/60 rounded-2xl text-emerald-700"><MessageSquare className="w-5 h-5"/></div>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-white/80 px-2 py-1 rounded-full shadow-sm"><TrendingUp className="w-3 h-3"/> {isSimulating ? '45%' : '12%'}</span>
                  </div>
                  <div className="text-3xl font-bold relative z-10">{metrics.tickets}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1 relative z-10">Tickets / Minute</div>
                </div>

                <div className={`${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm relative overflow-hidden group`}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#F7B6C2] rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-[#F7B6C2]/60 rounded-2xl text-pink-700"><TrendingUp className="w-5 h-5"/></div>
                    <span className="flex items-center gap-1 text-xs font-bold text-pink-600 bg-white/80 px-2 py-1 rounded-full shadow-sm"><TrendingUp className="w-3 h-3"/> {isSimulating ? '85%' : '28%'}</span>
                  </div>
                  <div className="text-3xl font-bold relative z-10">{metrics.liquidations}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1 relative z-10">Liquidations / Min</div>
                </div>

                <div className={`${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm relative overflow-hidden group`}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FFE8A3] rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-[#FFE8A3]/60 rounded-2xl text-amber-700"><Activity className="w-5 h-5"/></div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-white/80 px-2 py-1 rounded-full shadow-sm"><TrendingUp className="w-3 h-3"/> {isSimulating ? '20%' : '6%'}</span>
                  </div>
                  <div className="text-3xl font-bold relative z-10">{metrics.volatility}%</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1 relative z-10">Volatility</div>
                </div>

                <div className={`${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm relative overflow-hidden group`}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#E8DDFD] rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-[#E8DDFD]/60 rounded-2xl text-purple-700"><Terminal className="w-5 h-5"/></div>
                    <span className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-white/80 px-2 py-1 rounded-full shadow-sm"><TrendingUp className="w-3 h-3 transform rotate-180"/> {isSimulating ? '35%' : '8%'}</span>
                  </div>
                  <div className="text-3xl font-bold relative z-10">{metrics.systemLoad}%</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1 relative z-10">System Load</div>
                </div>
              </div>

              <div className="flex gap-6">
                
                {/* Center Main Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                  
                  {/* Live Market Activity Chart */}
                  <div className={`${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-8 shadow-sm flex flex-col h-[400px]`}>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-3">
                          Platform Activity
                          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 ${themeMode === 'light' ? 'bg-white border-slate-100' : 'bg-[#1e1b1a] border-white/10'} border shadow-sm text-emerald-500 rounded-full font-bold`}>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            LIVE
                          </span>
                        </h2>
                        <div className="text-sm font-medium text-slate-500 mt-1">Real-time incident signals</div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
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
                          <CartesianGrid strokeDasharray="3 3" stroke={themeMode === 'light' ? "#f1f5f9" : "#3b3634"} vertical={false} />
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} axisLine={false} tickLine={false} tickCount={5} domain={[0, 'auto']} />
                          <YAxis yAxisId="right" orientation="right" stroke="#cbd5e1" fontSize={11} axisLine={false} tickLine={false} tickCount={5} domain={[0, 'auto']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: themeMode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(42, 38, 37, 0.9)', backdropFilter: 'blur(10px)', border: themeMode === 'light' ? '1px solid #f1f5f9' : '1px solid #3b3634', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                            itemStyle={{ color: themeMode === 'light' ? '#1e293b' : '#f8fafc', fontWeight: 600 }}
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
                    <div className={`flex-1 ${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm flex flex-col h-[380px]`}>
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
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
                          let statusStyle = themeMode === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400';
                          let iconStyle = themeMode === 'light' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white/5 text-slate-500 border-white/10';
                          
                          if (s.step < activeStep) {
                            status = 'Completed';
                            statusStyle = 'bg-[#D7F5E8]/80 text-emerald-700';
                            iconStyle = 'bg-[#D7F5E8]/80 text-emerald-600 border-[#D7F5E8]';
                          } else if (s.step === activeStep) {
                            status = 'In Progress';
                            statusStyle = 'bg-[#FFE8A3]/80 text-amber-700';
                            iconStyle = 'bg-[#FFE8A3]/80 text-amber-600 border-[#FFE8A3] shadow-sm';
                          }

                          return (
                            <div key={s.step} className={`flex items-center justify-between p-4 rounded-2xl ${themeMode === 'light' ? 'bg-white border-white/60' : 'bg-white/5 border-white/10'} border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${iconStyle}`}>
                                  {s.step < activeStep ? <CheckCircle2 className="w-4 h-4"/> : s.step}
                                </div>
                                <div>
                                  <div className="text-sm font-bold">{s.title}</div>
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

                    {/* Tabbed Ops Tools (Log / Chat / Social) */}
                    <div className={`flex-1 ${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm flex flex-col h-[380px]`}>
                      
                      {/* Tabs Header */}
                      <div className={`flex items-center gap-2 mb-5 border-b ${themeMode === 'light' ? 'border-white/80' : 'border-white/10'} pb-2`}>
                        <button onClick={() => setBottomRightView('log')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${bottomRightView === 'log' ? (themeMode === 'light' ? 'bg-white shadow-sm text-slate-800' : 'bg-white/10 shadow-sm text-white') : 'text-slate-500 hover:text-slate-400'}`}>Decision Log</button>
                        <button onClick={() => setBottomRightView('chat')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5 ${bottomRightView === 'chat' ? (themeMode === 'light' ? 'bg-white shadow-sm text-slate-800' : 'bg-white/10 shadow-sm text-white') : 'text-slate-500 hover:text-slate-400'}`}>
                          Team Chat {teamChat.length > 2 && <span className="w-2 h-2 bg-pink-500 rounded-full"></span>}
                        </button>
                        <button onClick={() => setBottomRightView('social')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5 ${bottomRightView === 'social' ? (themeMode === 'light' ? 'bg-white shadow-sm text-slate-800' : 'bg-white/10 shadow-sm text-white') : 'text-slate-500 hover:text-slate-400'}`}>
                          Sentiment <Hash className="w-3 h-3"/>
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {bottomRightView === 'log' && (
                          <div className="space-y-5">
                            {logs.map((log, index) => (
                              <div key={log.id} className="flex gap-4 relative">
                                {index !== logs.length - 1 && <div className={`absolute left-[15px] top-[24px] bottom-[-20px] w-0.5 ${themeMode === 'light' ? 'bg-slate-100' : 'bg-white/5'}`}></div>}
                                <div className="relative z-10 shrink-0 mt-1">
                                  {log.type === 'INFO' && <div className={`w-8 h-8 rounded-full bg-[#E8DDFD] border-4 ${themeMode === 'light' ? 'border-white' : 'border-[#2a2625]'} flex items-center justify-center`}></div>}
                                  {log.type === 'WARNING' && <div className={`w-8 h-8 rounded-full bg-[#FFE8A3] border-4 ${themeMode === 'light' ? 'border-white' : 'border-[#2a2625]'} flex items-center justify-center`}></div>}
                                  {log.type === 'ACTION' && <div className={`w-8 h-8 rounded-full bg-[#D7F5E8] border-4 ${themeMode === 'light' ? 'border-white' : 'border-[#2a2625]'} flex items-center justify-center`}></div>}
                                </div>
                                <div className="flex-1 pb-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold">{log.message}</span>
                                    <span className="text-xs font-bold text-slate-400 font-mono ml-auto">{log.timestamp}</span>
                                  </div>
                                  {log.subtext && <div className="text-xs font-medium text-slate-500">{log.subtext}</div>}
                                </div>
                              </div>
                            ))}
                            <div ref={scrollRef} />
                          </div>
                        )}
                        {bottomRightView === 'chat' && (
                          <div className="space-y-4">
                            {/* ... Chat Content ... */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDEBAR - Comms */}
                <div className={`w-[380px] shrink-0 ${themeMode === 'light' ? 'bg-white/60 border-white/40' : 'bg-[#2a2625]/60 border-white/10'} backdrop-blur-xl border rounded-[28px] p-6 shadow-sm flex flex-col h-[804px]`}>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-coral-500" />
                    Incident Communication
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mb-6">Select a template to generate a draft.</p>
                  {/* Templates */}
                  <div className="space-y-3 mb-6">
                    {TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          selectedTemplate?.id === t.id 
                            ? (themeMode === 'light' ? 'bg-white border-[#FFD9C8] shadow-md scale-[1.02]' : 'bg-white/10 border-[#FFD9C8]/50 shadow-md scale-[1.02]')
                            : (themeMode === 'light' ? 'bg-white/50 border-white hover:bg-white hover:shadow-sm' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:shadow-sm')
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl border ${t.color}`}>
                            {t.icon}
                          </div>
                          <span className="text-sm font-bold flex-1">{t.title}</span>
                          <ChevronRight className={`w-5 h-5 ${selectedTemplate?.id === t.id ? 'text-coral-400' : 'text-slate-500'}`} />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Editable Draft Section */}
                  <div className={`flex-1 flex flex-col border rounded-2xl ${themeMode === 'light' ? 'bg-white/80 border-white' : 'bg-white/5 border-white/5'} shadow-sm p-5 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD9C8]/40 to-transparent rounded-bl-full pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <MessageSquare className="w-4 h-4"/>
                        Message Editor
                      </div>
                    </div>
                    <textarea 
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className={`text-sm font-medium ${themeMode === 'light' ? 'text-slate-600 bg-slate-50/70 border-slate-200' : 'text-slate-300 bg-[#1e1b1a]/70 border-white/10'} leading-relaxed p-4 rounded-xl border mb-6 relative z-10 w-full resize-none h-32 focus:outline-none focus:border-[#FFD9C8] focus:ring-1 focus:ring-[#FFD9C8]`}
                    />
                    <button onClick={sendCommunication} className="w-full mt-auto py-3.5 bg-gradient-to-r from-[#FFD9C8] to-[#F7B6C2] hover:opacity-90 text-slate-900 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm relative z-10">
                      <Send className="w-4 h-4 text-orange-600" />
                      Dispatch Communication
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Fallback for other generic tabs */}
          {activeTab !== 'Dashboard' && activeTab !== 'Reports' && activeTab !== 'Incidents' && activeTab !== 'Live Markets' && activeTab !== 'Settings' && activeTab !== 'Market Monitor' && (
             <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center">
               <h2 className="text-3xl font-bold mb-2">{activeTab}</h2>
               <p className="text-slate-500 font-medium">This module is currently under construction.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
