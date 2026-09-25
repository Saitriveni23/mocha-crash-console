import {
  Activity,
  Bell,
  CheckCircle2,
  ClipboardList,
  FastForward,
  FileText,
  Heart,
  Home,
  Info,
  Menu,
  MessageSquareText,
  Pause,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  Target,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Avatar, LiveDot } from './components/ui';
import { TEAM_MEMBERS } from './mockData';
import Alerts from './pages/Alerts';
import Communications from './pages/Communications';
import IncidentLog from './pages/IncidentLog';
import LiveFeeds from './pages/LiveFeeds';
import MarketMonitor from './pages/MarketMonitor';
import Overview from './pages/Overview';
import Settings from './pages/Settings';
import Templates from './pages/Templates';
import { DashboardProvider, useDashboard } from './store';
import type { NavigationTab } from './types';

const NAV: { id: NavigationTab; icon: ReactNode }[] = [
  { id: 'Overview', icon: <Home className="w-[18px] h-[18px]" /> },
  { id: 'Market Monitor', icon: <Target className="w-[18px] h-[18px]" /> },
  { id: 'Live Feeds', icon: <Activity className="w-[18px] h-[18px]" /> },
  { id: 'Alerts', icon: <Bell className="w-[18px] h-[18px]" /> },
  { id: 'Communications', icon: <MessageSquareText className="w-[18px] h-[18px]" /> },
  { id: 'Incident Log', icon: <ClipboardList className="w-[18px] h-[18px]" /> },
  { id: 'Templates', icon: <FileText className="w-[18px] h-[18px]" /> },
  { id: 'Settings', icon: <SettingsIcon className="w-[18px] h-[18px]" /> },
];

const PAGES: Record<NavigationTab, () => ReactNode> = {
  Overview: () => <Overview />,
  'Market Monitor': () => <MarketMonitor />,
  'Live Feeds': () => <LiveFeeds />,
  Alerts: () => <Alerts />,
  Communications: () => <Communications />,
  'Incident Log': () => <IncidentLog />,
  Templates: () => <Templates />,
  Settings: () => <Settings />,
};

function Logo() {
  return (
    <svg viewBox="0 0 40 28" className="w-9 h-7" aria-hidden>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff4f9a" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M2 26 L10 3 Q12 -1 14 3 L20 16 L26 3 Q28 -1 30 3 L38 26 L31 26 L27.5 14 L22.5 25 Q20 29 17.5 25 L12.5 14 L9 26 Z" fill="url(#logo-grad)" />
    </svg>
  );
}

function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-40 left-1/4 w-[700px] h-[500px] rounded-full bg-purple-700/20 blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[140px]" />
      <div className="absolute -bottom-32 left-0 w-[500px] h-[400px] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] cyber-grid-wavy" />
      <div className="absolute -bottom-10 left-0 right-0 h-[40vh] cyber-grid-perspective" />
    </div>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  const { now } = useDashboard();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="h-16 shrink-0 flex items-center gap-4 px-4 lg:px-5 border-b border-white/5 bg-[#0b0e1b]/70 backdrop-blur-xl relative z-20">
      <button className="lg:hidden p-2 -ml-2 text-slate-300" onClick={onMenu} aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2 lg:w-[196px] shrink-0">
        <Logo />
        <span className="text-lg font-extrabold text-white tracking-tight hidden sm:inline">MochaTrade</span>
      </div>
      <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-rose-600 to-pink-500 text-white text-xs font-bold tracking-wide glow-pink shrink-0">
        <Zap className="w-3.5 h-3.5 fill-white" /> FLASH CRASH
      </span>
      <span className="text-sm text-slate-300 font-medium hidden md:inline">Incident Response Dashboard</span>

      <div className="ml-auto flex items-center gap-4 lg:gap-6 text-sm">
        <span className="flex items-center gap-2 text-slate-200 font-semibold">
          <LiveDot /> LIVE
        </span>
        <span className="text-slate-200 font-semibold hidden sm:inline">{time}</span>
        <span className="text-slate-400 font-medium hidden md:inline">{date}</span>
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="flex -space-x-2.5">
            {TEAM_MEMBERS.map(m => (
              <Avatar key={m.id} member={m} size={30} ring="border-[#0b0e1b]" />
            ))}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-bold text-white">Ops Team</div>
            <div className="text-[11px] text-slate-400">{TEAM_MEMBERS.length} online</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tab, setTab, activeAlerts, userAlerts, simulationElapsed, simulationRunning, startSimulation, pauseSimulation, advanceSimulation, resetSimulation, activeUserId, setActiveUserId } = useDashboard();
  const badges: Partial<Record<NavigationTab, number>> = { Alerts: activeAlerts, 'Market Monitor': userAlerts.length };
  const activeUser = TEAM_MEMBERS.find(member => member.id === activeUserId) ?? TEAM_MEMBERS[0];

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[228px] shrink-0 flex flex-col bg-[#0b0e1b]/95 lg:bg-transparent border-r border-white/5 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="lg:hidden flex justify-end p-3">
          <button onClick={onClose} className="p-1.5 text-slate-400" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mx-3 mt-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-purple-200"><FastForward className="w-3.5 h-3.5" /> Time Machine</div>
          <div className="text-[11px] text-slate-400 mt-1">Minute {Math.min(Math.floor(simulationElapsed / 60), 60)} / 60</div>
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mt-2"><div className="h-full bg-linear-to-r from-purple-500 to-pink-500" style={{ width: `${Math.min(100, (simulationElapsed / 3600) * 100)}%` }} /></div>
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            <button onClick={simulationRunning ? pauseSimulation : startSimulation} className="flex items-center justify-center rounded-lg bg-white/10 py-1.5 text-slate-200 hover:bg-white/20" title={simulationRunning ? 'Pause simulation' : 'Resume simulation'}>{simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</button>
            <button onClick={() => advanceSimulation(10)} className="flex items-center justify-center rounded-lg bg-white/10 py-1.5 text-slate-200 hover:bg-white/20" title="Advance 10 minutes"><FastForward className="w-3.5 h-3.5" /></button>
            <button onClick={resetSimulation} className="flex items-center justify-center rounded-lg bg-white/10 py-1.5 text-slate-200 hover:bg-white/20" title="Reset simulation"><RotateCcw className="w-3.5 h-3.5" /></button>
            <span className="flex items-center justify-center rounded-lg border border-white/10 text-[10px] font-bold text-purple-200">10m</span>
          </div>
        </div>
        <div className="mx-3 mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo login</div>
          <div className="text-xs font-semibold text-white mt-1 truncate">{activeUser.name}</div>
          <div className="grid grid-cols-3 gap-1 mt-2">
            {TEAM_MEMBERS.map(member => (
              <button key={member.id} onClick={() => setActiveUserId(member.id)} className={`rounded-md py-1.5 text-[10px] font-bold ${activeUserId === member.id ? 'bg-purple-500/40 text-white border border-purple-300/50' : 'bg-white/5 text-slate-400 hover:text-white'}`} title={`Sign in as ${member.name}`}>
                {member.shortName}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Tasks can only be completed by their owner.</div>
        </div>
        <nav className="px-3 pt-4 space-y-1">
          {NAV.map(n => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => {
                  setTab(n.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-linear-to-r from-purple-600/60 to-indigo-600/30 text-white border border-purple-400/40 glow-purple'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {n.icon}
                {n.id}
                {!!badges[n.id] && (
                  <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center glow-pink">
                    {badges[n.id]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto relative h-64 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 228 256" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="wave-a" x1="0" x2="1">
                <stop offset="0%" stopColor="#ff2a5f" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="wave-b" x1="0" x2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <path
                key={i}
                d={`M0 ${40 + i * 6} C 60 ${-10 + i * 10}, 120 ${90 + i * 4}, 228 ${20 + i * 8}`}
                fill="none"
                stroke={i % 2 ? 'url(#wave-b)' : 'url(#wave-a)'}
                strokeWidth={1.2}
              />
            ))}
          </svg>
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-white font-bold text-[17px] leading-snug">
              Stay calm.
              <br />
              Take action.
              <br />
              Use all views.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 font-semibold">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500/30" /> MochaTrade Ops
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Toasts() {
  const { toasts } = useDashboard();
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
    danger: <XCircle className="w-4 h-4 text-rose-400" />,
  };
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className="cyber-card rounded-xl px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-white animate-fade-up">
          {icons[t.tone]} {t.title}
        </div>
      ))}
    </div>
  );
}

function Shell() {
  const { tab } = useDashboard();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#0b0e1b] text-slate-100 relative overflow-hidden">
      <Background />
      <Header onMenu={() => setMenuOpen(true)} />
      <div className="flex-1 flex min-h-0 relative z-10">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-4 lg:p-5">
          <div key={tab} className="animate-fade-up">
            {PAGES[tab]()}
          </div>
        </main>
      </div>
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <Shell />
    </DashboardProvider>
  );
}
