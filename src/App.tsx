import {
  Activity,
  Bell,
  Brain,
  ClipboardList,
  Coffee,
  FastForward,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Target,
  User,
  X,
  Menu,
  CheckCircle2,
  Info,
  XCircle,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Avatar } from './components/ui';
import { LivePulse } from './primitives';
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

const NAV: { id: NavigationTab; icon: ReactNode; label: string }[] = [
  { id: 'Overview',       icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: 'Dashboard'    },
  { id: 'Live Feeds',     icon: <Activity         className="w-[18px] h-[18px]" />, label: 'Live Feeds'  },
  { id: 'Market Monitor', icon: <Target           className="w-[18px] h-[18px]" />, label: 'Market'      },
  { id: 'Alerts',         icon: <Bell             className="w-[18px] h-[18px]" />, label: 'Alerts'      },
  { id: 'Communications', icon: <MessageSquareText className="w-[18px] h-[18px]" />, label: 'Comms'     },
  { id: 'Incident Log',   icon: <ClipboardList    className="w-[18px] h-[18px]" />, label: 'Incidents'   },
  { id: 'Templates',      icon: <FileText         className="w-[18px] h-[18px]" />, label: 'Templates'   },
  { id: 'Settings',       icon: <SettingsIcon     className="w-[18px] h-[18px]" />, label: 'Settings'    },
];

const PAGES: Record<NavigationTab, () => ReactNode> = {
  'Overview':       () => <Overview />,
  'Market Monitor': () => <MarketMonitor />,
  'Live Feeds':     () => <LiveFeeds />,
  'Alerts':         () => <Alerts />,
  'Communications': () => <Communications />,
  'Incident Log':   () => <IncidentLog />,
  'Templates':      () => <Templates />,
  'Settings':       () => <Settings />,
};

// ─── Logo ────────────────────────────────────────────
function MochaLogo() {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D9A35E]/30 to-transparent border border-[#D9A35E]/25 flex items-center justify-center shadow-[0_0_16px_rgba(217,163,94,0.15)]">
      <Coffee className="w-5 h-5 text-[#D9A35E]" />
    </div>
  );
}

// ─── Top Header ──────────────────────────────────────
function Header({ onMenu }: { onMenu: () => void }) {
  const { now } = useDashboard();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="h-14 shrink-0 flex items-center gap-4 px-5 border-b border-[#2A211D] bg-[#090807]/80 backdrop-blur-xl relative z-20">
      <button className="lg:hidden p-2 -ml-2 text-[#A49A92]" onClick={onMenu}>
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5 lg:w-[200px] shrink-0">
        <MochaLogo />
        <span className="text-[15px] font-bold text-[#F6EBDD] tracking-tight hidden sm:inline">
          Mocha<span className="text-[#D9A35E]">Trade</span>
        </span>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs bg-[#1F1916] border border-[#2A211D] rounded-full px-4 py-2 focus-within:border-[#D9A35E]/40 transition-colors">
        <Search className="w-3.5 h-3.5 text-[#A49A92] shrink-0" />
        <input className="bg-transparent outline-none text-[13px] text-[#F6EBDD] placeholder-[#A49A92] w-full" placeholder="Search assets, alerts…" />
      </div>

      <div className="ml-auto flex items-center gap-5">
        <LivePulse />
        <span className="text-sm font-semibold text-[#F6EBDD] font-mono-numbers hidden sm:inline">{time}</span>
        <span className="text-xs text-[#A49A92] hidden md:inline">{date}</span>
        <div className="flex -space-x-2 hidden sm:flex">
          {TEAM_MEMBERS.slice(0, 3).map(m => <Avatar key={m.id} member={m} size={28} ring="border-[#090807]" />)}
        </div>
        <button className="relative text-[#A49A92] hover:text-[#D9A35E] transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#1F1916] border border-[#2A211D] flex items-center justify-center text-[#A49A92] hover:border-[#D9A35E]/40 transition-colors cursor-pointer">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

// ─── Sidebar ─────────────────────────────────────────
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tab, setTab, activeAlerts, userAlerts, simulationElapsed, simulationRunning, startSimulation, pauseSimulation, advanceSimulation, resetSimulation } = useDashboard();
  const badges: Partial<Record<NavigationTab, number>> = { Alerts: activeAlerts, 'Market Monitor': userAlerts.length };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[220px] shrink-0 flex flex-col bg-[#0D0B09] border-r border-[#2A211D] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile close */}
        <div className="lg:hidden flex justify-end p-3">
          <button onClick={onClose} className="p-1.5 text-[#A49A92]"><X className="w-5 h-5" /></button>
        </div>

        {/* Simulation Control */}
        <div className="mx-3 mt-4 rounded-2xl border border-[#2A211D] bg-[#1F1916] p-3.5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#D9A35E] mb-1">
            <FastForward className="w-3 h-3" /> Simulation
          </div>
          <div className="text-[11px] text-[#A49A92] mb-2">Minute {Math.min(Math.floor(simulationElapsed / 60), 60)} / 60</div>
          <div className="h-1 bg-[#090807] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-[#D9A35E] to-[#B66A3C] rounded-full transition-all" style={{ width: `${Math.min(100, (simulationElapsed / 3600) * 100)}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button onClick={simulationRunning ? pauseSimulation : startSimulation} className="flex items-center justify-center rounded-xl bg-[#090807] border border-[#2A211D] py-1.5 text-[#A49A92] hover:text-[#D9A35E] hover:border-[#D9A35E]/30 transition-all text-xs">
              {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => advanceSimulation(10)} className="flex items-center justify-center rounded-xl bg-[#090807] border border-[#2A211D] py-1.5 text-[#A49A92] hover:text-[#D9A35E] hover:border-[#D9A35E]/30 transition-all">
              <FastForward className="w-3.5 h-3.5" />
            </button>
            <button onClick={resetSimulation} className="flex items-center justify-center rounded-xl bg-[#090807] border border-[#2A211D] py-1.5 text-[#A49A92] hover:text-[#D9A35E] hover:border-[#D9A35E]/30 transition-all">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 pt-5 space-y-0.5 flex-1">
          {NAV.map(n => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => { setTab(n.id); onClose(); }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#1F1916] text-[#F6EBDD] border border-[#2A211D]'
                    : 'text-[#A49A92] hover:text-[#F6EBDD] hover:bg-[#1F1916]/60 border border-transparent'
                }`}
              >
                {active && <div className="nav-active-bar" />}
                <span className={active ? 'text-[#D9A35E]' : ''}>{n.icon}</span>
                {n.label}
                {!!badges[n.id] && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-[#F87171]/20 border border-[#F87171]/30 text-[#F87171] text-[10px] font-bold flex items-center justify-center">
                    {badges[n.id]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom AI status */}
        <div className="mx-3 mb-4 mt-2 rounded-2xl border border-[#2A211D] bg-[#1F1916] p-3">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-full bg-[#D9A35E]/10 border border-[#D9A35E]/20 flex items-center justify-center shrink-0">
              <Brain className="w-3.5 h-3.5 text-[#D9A35E]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#48D597] rounded-full border border-[#090807]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#F6EBDD]">AI Oracle</div>
              <div className="text-[10px] text-[#48D597]">Connected · GPT-4</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Toast ───────────────────────────────────────────
function Toasts() {
  const { toasts } = useDashboard();
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#48D597]" />,
    info:    <Info         className="w-4 h-4 text-[#D9A35E]"  />,
    danger:  <XCircle      className="w-4 h-4 text-[#F87171]"  />,
  };
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className="mt-glass rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-[#F6EBDD] animate-fade-up">
          {icons[t.tone]} {t.title}
        </div>
      ))}
    </div>
  );
}

// ─── Shell ───────────────────────────────────────────
function Shell() {
  const { tab } = useDashboard();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#090807] text-[#F6EBDD] relative overflow-hidden">
      {/* Subtle warm radial ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-[#B66A3C]/6 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-[#D9A35E]/5 blur-[160px]" />
      </div>

      <Header onMenu={() => setMenuOpen(true)} />
      <div className="flex-1 flex min-h-0 relative z-10">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-5 lg:p-6">
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
