import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  Monitor,
  Phone,
  Play,
  Pause,
  Send,
  Settings,
  ShieldAlert,
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
  icon: JSX.Element;
  color: string;
};

// --- Constants & Config ---
const TEMPLATES: CommunicationTemplate[] = [
  {
    id: 't1',
    title: 'Halt Trading Announcement (Twitter/X)',
    content: 'We are temporarily halting trading due to elevated volatility and unusual market conditions. Our team is actively monitoring the situation and will provide updates shortly. Thank you for your patience.',
    icon: <Share2 className="w-5 h-5 text-blue-400" />,
    color: 'border-blue-500/30 bg-blue-500/10'
  },
  {
    id: 't2',
    title: 'Support Delay Notice (In-App)',
    content: 'Our support team is currently experiencing high volume. Wait times may be longer than usual. Please check our status page for immediate updates on platform stability.',
    icon: <Smartphone className="w-5 h-5 text-red-400" />,
    color: 'border-red-500/30 bg-red-500/10'
  },
  {
    id: 't3',
    title: 'All Clear (Internal & External)',
    content: 'Market conditions have stabilized. We are resuming normal operations. All systems are operating nominally. Thank you for your patience.',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    color: 'border-emerald-500/30 bg-emerald-500/10'
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

  const [activeStep, setActiveStep] = useState(4); // 1-5 for the playbook

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
    <div className="min-h-screen bg-[#070b14] text-slate-300 font-sans flex h-screen overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-[#0a1120] border-r border-[#1e293b] flex flex-col pt-4 pb-6">
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">MochaTrade</h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg font-medium border border-blue-500/20">
            <Monitor className="w-5 h-5" />
            Ops Console
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-[#111a2f] rounded-lg font-medium transition-colors">
            <AlertTriangle className="w-5 h-5" />
            Incidents
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-[#111a2f] rounded-lg font-medium transition-colors">
            <TrendingUp className="w-5 h-5" />
            Reports
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-[#111a2f] rounded-lg font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full bg-[#040811] overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-[#0a1120] border-b border-[#1e293b] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">Ops Console</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">System Health</div>
                <div className="text-emerald-400 font-medium">Healthy</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Market Status</div>
                <div className="text-emerald-400 font-medium">Normal</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Incident Status</div>
                <div className="text-amber-500 font-medium">Monitoring</div>
              </div>
            </div>
            
            {/* Header Button */}
            <div className="ml-4">
              <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Pause Scenario' : 'Run Flash-Crash Scenario'}
              </button>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <div className="text-right">
                <div className="text-slate-200 font-medium">10:20:17</div>
                <div className="text-[10px] text-slate-500">Apr 24, 2025</div>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD GRID */}
        <div className="flex-1 p-6 flex gap-6 overflow-hidden">
          
          {/* CENTER PANEL */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            
            {/* Chart Card */}
            <div className="bg-[#0a1120] border border-[#1e293b] rounded-xl p-5 flex flex-col h-[380px] shrink-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    Live Market Activity
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      Live
                    </span>
                  </h2>
                  <div className="text-sm text-slate-400 mt-1">Incoming Tickets & Liquidations</div>
                </div>
                
                {/* Metric Cards Row */}
                <div className="flex gap-4">
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-4 py-2 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-md"><MessageSquare className="w-4 h-4 text-blue-400"/></div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tickets/min</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        {metrics.tickets} <span className="text-[10px] text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/> 12%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-4 py-2 flex items-center gap-3">
                    <div className="bg-red-500/20 p-2 rounded-md"><TrendingUp className="w-4 h-4 text-red-400"/></div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Liquidations/min</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        {metrics.liquidations} <span className="text-[10px] text-red-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/> 28%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-4 py-2 flex items-center gap-3">
                    <div className="bg-amber-500/20 p-2 rounded-md"><Activity className="w-4 h-4 text-amber-400"/></div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Volatility</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        {metrics.volatility}% <span className="text-[10px] text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/> 6%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-4 py-2 flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-md"><Terminal className="w-4 h-4 text-emerald-400"/></div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">System Load</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        {metrics.systemLoad}% <span className="text-[10px] text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5 transform rotate-180"/> 8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#ef4444" fontSize={10} axisLine={false} tickLine={false} tickCount={5} domain={[0, 60]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#eab308" fontSize={10} axisLine={false} tickLine={false} tickCount={5} domain={[0, 24]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    
                    <Line yAxisId="left" type="monotone" dataKey="liquidations" name="Liquidations/min" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ef4444', stroke: '#0f172a' }} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="tickets" name="Incoming Tickets/min" stroke="#eab308" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#eab308', stroke: '#0f172a' }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-[11px] font-medium">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <div className="w-2 h-0.5 bg-amber-400 rounded-full"></div> Incoming Tickets/min
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <div className="w-2 h-0.5 bg-red-400 rounded-full"></div> Liquidations/min
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex gap-6 flex-1 min-h-0">
              
              {/* Playbook */}
              <div className="flex-1 bg-[#0a1120] border border-[#1e293b] rounded-xl p-5 flex flex-col overflow-hidden">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400"/>
                  Response Protocol (Playbook)
                </h3>
                <p className="text-xs text-slate-400 mb-4">5-step incident response workflow</p>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {[
                    { step: 1, title: 'Assess Volatility', desc: 'Check market conditions and system metrics' },
                    { step: 2, title: 'Notify Management', desc: 'Alert ops, risk and leadership teams' },
                    { step: 3, title: 'Halt Margin', desc: 'Pause margin trading and update risk limits' },
                    { step: 4, title: 'Draft Comms', desc: 'Prepare and review customer communication' },
                    { step: 5, title: 'Resume Normal', desc: 'Verify stability and restore trading' },
                  ].map((s) => {
                    let status = 'Pending';
                    let statusStyle = 'bg-[#0f172a] text-slate-500 border border-slate-700/50';
                    let iconStyle = 'bg-[#0f172a] text-slate-500 border-slate-700/50';
                    
                    if (s.step < activeStep) {
                      status = 'Completed';
                      statusStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      iconStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                    } else if (s.step === activeStep) {
                      status = 'In Progress';
                      statusStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                      iconStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                    }

                    return (
                      <div key={s.step} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-[#1e293b]">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${iconStyle}`}>
                            {s.step < activeStep ? <CheckCircle2 className="w-3 h-3"/> : s.step}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">{s.title}</div>
                            <div className="text-[10px] text-slate-500">{s.desc}</div>
                          </div>
                        </div>
                        <div className={`text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1 ${statusStyle}`}>
                          {status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                          {status}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Log */}
              <div className="flex-1 bg-[#0a1120] border border-[#1e293b] rounded-xl p-5 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400"/>
                    Ops Decision Log
                  </h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All &rarr;</button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {logs.map(log => (
                    <div key={log.id} className="flex gap-4">
                      <div className="text-xs text-slate-500 font-mono mt-0.5 w-10 shrink-0">{log.timestamp}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-200">{log.message}</div>
                        {log.subtext && <div className="text-[11px] text-slate-500 mt-0.5">{log.subtext}</div>}
                      </div>
                      <div className="shrink-0">
                        {log.type === 'INFO' && <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-semibold tracking-wider">INFO</span>}
                        {log.type === 'WARNING' && <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-semibold tracking-wider">WARNING</span>}
                        {log.type === 'ACTION' && <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold tracking-wider">ACTION</span>}
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR - Comms */}
          <div className="w-[340px] flex flex-col gap-4 shrink-0 overflow-y-auto">
            
            <div className="bg-[#0a1120] border border-[#1e293b] rounded-xl p-5 flex-1 flex flex-col min-h-0">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-400" />
                Incident Communication
              </h3>
              <p className="text-xs text-slate-400 mb-5">Pre-approved templates for rapid deployment during an incident. Select to draft.</p>

              {/* Templates */}
              <div className="space-y-2.5 mb-6">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition-colors ${
                      selectedTemplate?.id === t.id 
                        ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-[#0f172a] border-[#1e293b] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md border ${t.color}`}>
                        {t.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{t.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${selectedTemplate?.id === t.id ? 'text-blue-400' : 'text-slate-500'}`} />
                  </button>
                ))}
              </div>

              {/* Draft Section */}
              <div className="flex-1 flex flex-col border border-[#1e293b] rounded-xl bg-[#0f172a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                    <MessageSquare className="w-4 h-4"/>
                    Message Preview
                  </div>
                  <button className="text-[10px] text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded hover:bg-blue-500/10 transition-colors flex items-center gap-1">
                    Edit
                  </button>
                </div>
                
                <div className="text-sm text-slate-300 leading-relaxed bg-[#0a1120] p-3 rounded-lg border border-[#1e293b] mb-4">
                  {selectedTemplate?.content || "Select a template above..."}
                </div>

                <div className="mb-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Audience</div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium"><Users className="w-3 h-3"/> All Users</span>
                    <span className="text-xs bg-[#1e293b] text-slate-400 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#334155]"><Users className="w-3 h-3"/> Internal</span>
                    <span className="text-xs bg-[#1e293b] text-slate-400 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#334155]"><Users className="w-3 h-3"/> External</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Channel</div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium"><Share2 className="w-3 h-3"/> Twitter/X</span>
                    <span className="text-xs bg-[#1e293b] text-slate-400 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#334155]"><Smartphone className="w-3 h-3"/> In-App</span>
                    <span className="text-xs bg-[#1e293b] text-slate-400 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#334155]"><Mail className="w-3 h-3"/> Email</span>
                  </div>
                </div>

                <button
                  onClick={sendCommunication}
                  disabled={!selectedTemplate}
                  className="w-full mt-auto py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                >
                  <Send className="w-4 h-4" />
                  Dispatch Communication
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
