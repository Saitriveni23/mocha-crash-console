import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ALERT_RULES,
  BTC_CRASH_DATA,
  COMMUNICATION_TEMPLATES,
  INITIAL_INCIDENT_LOG,
  INITIAL_INCIDENT_STEPS,
  LIQUIDATION_SPARKLINE,
  LIVE_TRADES_FEED,
  SENTIMENT_SPARKLINE,
  TICKET_SPARKLINE,
} from './mockData';
import type {
  AlertRule,
  CommunicationTemplate,
  IncidentLogItem,
  IncidentStep,
  LiveTradeFeedItem,
  LogCategory,
  NavigationTab,
  SentMessage,
  Toast,
} from './types';

export interface Settings {
  live: boolean;
  speedMs: number;
  liquidationThreshold: number;
  ticketThreshold: number;
  sentimentThreshold: number;
  channels: Record<string, boolean>;
  compactMode: boolean;
}

// Scenario clock: the incident started at 10:34:26, the dashboard opens at 10:47:00
const SCENARIO_START = new Date(2025, 3, 25, 10, 47, 0).getTime();
const INITIAL_ELAPSED = 12 * 60 + 34;

const HUBS = ['NY Hub', 'London', 'Tokyo', 'Singapore', 'Frankfurt', 'São Paulo'];
const FEED_PAIRS = [
  { pair: 'BTC/USDT', unit: 'BTC', price: 61482, qty: [5, 220] },
  { pair: 'ETH/USDT', unit: 'ETH', price: 2841, qty: [80, 1500] },
  { pair: 'SOL/USDT', unit: 'SOL', price: 134, qty: [900, 14000] },
  { pair: 'BNB/USDT', unit: 'BNB', price: 532, qty: [100, 2000] },
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const uid = () => Math.random().toString(36).slice(2, 9);

const TABS: NavigationTab[] = ['Overview', 'Live Feeds', 'Alerts', 'Communications', 'Incident Log', 'Templates', 'Settings'];
const toSlug = (t: NavigationTab) => t.toLowerCase().replace(' ', '-');
const tabFromHash = () => TABS.find(t => toSlug(t) === window.location.hash.slice(1)) ?? 'Overview';

function useDashboardState() {
  const [tab, setTabState] = useState<NavigationTab>(tabFromHash);

  // Keep the URL hash in sync so pages can be bookmarked and back/forward works
  const setTab = useCallback((t: NavigationTab) => {
    window.location.hash = toSlug(t);
    setTabState(t);
  }, []);
  useEffect(() => {
    const onHash = () => setTabState(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [tick, setTick] = useState(0);

  const [settings, setSettings] = useState<Settings>({
    live: true,
    speedMs: 2500,
    liquidationThreshold: 5000,
    ticketThreshold: 500,
    sentimentThreshold: -50,
    channels: { 'Twitter/X': true, 'In-App Banner': true, Email: true, Telegram: false, 'Status Page': true, 'Help Center': true },
    compactMode: false,
  });

  const [metrics, setMetrics] = useState({ liquidations: 12842, tickets: 1248, sentiment: -72, btcPrice: 61482.32 });
  const [liqSpark, setLiqSpark] = useState(LIQUIDATION_SPARKLINE);
  const [ticketSpark, setTicketSpark] = useState(TICKET_SPARKLINE);
  const [sentimentSpark, setSentimentSpark] = useState(SENTIMENT_SPARKLINE);
  const [btcSeries, setBtcSeries] = useState(BTC_CRASH_DATA);
  const [feed, setFeed] = useState<LiveTradeFeedItem[]>(LIVE_TRADES_FEED);

  const [logs, setLogs] = useState<IncidentLogItem[]>(INITIAL_INCIDENT_LOG);
  const [steps, setSteps] = useState<IncidentStep[]>(INITIAL_INCIDENT_STEPS);
  const [alertRules, setAlerts] = useState<AlertRule[]>(ALERT_RULES);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>(COMMUNICATION_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState(COMMUNICATION_TEMPLATES[0].id);
  const [sent, setSent] = useState<SentMessage[]>([
    { id: 's0', time: '10:46', title: 'Market Volatility & Margin Trading Pause', channels: ['Twitter/X', 'In-App Banner'], audience: 'All Users', reach: 184_220 },
  ]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // One-second clock: drives the header time and the "since anomaly" timer
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date(SCENARIO_START + tick * 1000);
  const elapsed = INITIAL_ELAPSED + tick;
  const clockHM = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const clockHMS = now.toLocaleTimeString('en-US', { hour12: false });
  const clockRef = useRef(clockHM);
  const clockHMSRef = useRef(clockHMS);
  useEffect(() => {
    clockRef.current = clockHM;
    clockHMSRef.current = clockHMS;
  }, [clockHM, clockHMS]);

  // Market simulation
  useEffect(() => {
    if (!settings.live) return;
    const id = setInterval(() => {
      const t = clockHMSRef.current;
      setMetrics(m => ({
        liquidations: Math.max(0, Math.round(m.liquidations + (Math.random() - 0.35) * 420)),
        tickets: Math.max(0, Math.round(m.tickets + (Math.random() - 0.35) * 46)),
        sentiment: Math.max(-99, Math.min(20, Math.round(m.sentiment + (Math.random() - 0.55) * 3))),
        btcPrice: Math.max(55000, +(m.btcPrice + (Math.random() - 0.55) * 120).toFixed(2)),
      }));
      setLiqSpark(s => [...s.slice(1), { t, v: Math.max(0, s[s.length - 1].v + (Math.random() - 0.4) * 1400) }]);
      setTicketSpark(s => [...s.slice(1), { t, v: Math.max(0, s[s.length - 1].v + (Math.random() - 0.4) * 140) }]);
      setSentimentSpark(s => {
        const last = s[s.length - 1];
        return [
          ...s.slice(1),
          {
            t,
            sentiment: Math.max(-99, Math.min(10, last.sentiment + (Math.random() - 0.5) * 16)),
            liquidation: Math.min(105, Math.max(50, last.liquidation + (Math.random() - 0.5) * 16)),
            ticket: Math.min(105, Math.max(50, last.ticket + (Math.random() - 0.5) * 16)),
          },
        ];
      });
      setBtcSeries(s => {
        const last = s[s.length - 1];
        const [h, mm] = last.time.split(':').map(Number);
        const next = h * 60 + mm + 1;
        const time = `${Math.floor(next / 60)}:${String(next % 60).padStart(2, '0')}`;
        const price = Math.max(55000, Math.round(last.price + (Math.random() - 0.52) * 260));
        return [...s.slice(1), { time, price, volume: Math.round(1500 + Math.random() * 1600) }];
      });
      setFeed(f => {
        const p = pick(FEED_PAIRS);
        const qty = p.qty[0] + Math.random() * (p.qty[1] - p.qty[0]);
        const price = p.price * (1 + (Math.random() - 0.5) * 0.004);
        const r = Math.random();
        const item: LiveTradeFeedItem = {
          id: uid(),
          time: t,
          pair: p.pair,
          type: r < 0.55 ? 'LIQUIDATION' : r < 0.8 ? 'SELL' : 'BUY',
          amount: `${qty.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${p.unit}`,
          price: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          value: `$${((qty * price) / 1e6).toFixed(2)}M`,
          sourceHub: pick(HUBS),
        };
        return [item, ...f].slice(0, 40);
      });
    }, settings.speedMs);
    return () => clearInterval(id);
  }, [settings.live, settings.speedMs]);

  const notify = useCallback((title: string, tone: Toast['tone'] = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, title, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const addLog = useCallback((text: string, category: LogCategory, author = 'You (Team Lead)', status: IncidentLogItem['status'] = 'done', notes?: string) => {
    setLogs(l => [...l, { id: uid(), time: clockRef.current, text, category, status, author, notes }]);
  }, []);

  const toggleLog = useCallback((id: string) => {
    setLogs(l => l.map(x => (x.id === id ? { ...x, status: x.status === 'done' ? 'pending' : 'done' } : x)));
  }, []);

  const removeLog = useCallback((id: string) => setLogs(l => l.filter(x => x.id !== id)), []);

  // Complete the first in-progress step and start the next pending one
  const advanceStep = useCallback(() => {
    setSteps(s => {
      const i = s.findIndex(x => x.status === 'In progress');
      if (i === -1) return s;
      const next = s.map(x => ({ ...x }));
      next[i].status = 'Completed';
      const p = next.findIndex(x => x.status === 'Pending');
      if (p !== -1 && !next.some(x => x.status === 'In progress')) next[p].status = 'In progress';
      return next;
    });
  }, []);

  const resetSteps = useCallback(() => setSteps(INITIAL_INCIDENT_STEPS), []);

  const sendMessage = useCallback(
    (title: string, channels: string[], audience: string) => {
      setSent(s => [{ id: uid(), time: clockRef.current, title, channels, audience, reach: Math.round(80_000 + Math.random() * 160_000) }, ...s]);
      addLog(`Sent customer communication: ${title}`, 'Comms');
      notify(`Broadcast sent via ${channels.length} channel${channels.length === 1 ? '' : 's'}`);
    },
    [addLog, notify],
  );

  // The three incident rules are evaluated live against the configured thresholds
  const alerts = alertRules.map(a => {
    const live: Record<string, { threshold: string; metric: string; firing: boolean }> = {
      'ar-1': {
        threshold: `> ${settings.liquidationThreshold.toLocaleString('en-US')} liquidations / 60s`,
        metric: `${metrics.liquidations.toLocaleString('en-US')} (Current)`,
        firing: metrics.liquidations > settings.liquidationThreshold,
      },
      'ar-2': {
        threshold: `> ${settings.ticketThreshold.toLocaleString('en-US')} new tickets / min`,
        metric: `${metrics.tickets.toLocaleString('en-US')} (Current)`,
        firing: metrics.tickets > settings.ticketThreshold,
      },
      'ar-3': {
        threshold: `< ${settings.sentimentThreshold}% net negative sentiment`,
        metric: `${metrics.sentiment}% (Current)`,
        firing: metrics.sentiment < settings.sentimentThreshold,
      },
    };
    const l = live[a.id];
    if (!l) return a;
    const status: AlertRule['status'] = a.status === 'PAUSED' ? 'PAUSED' : l.firing ? 'FIRING' : 'NORMAL';
    return { ...a, threshold: l.threshold, metric: l.metric, status };
  });

  const activeAlerts = alerts.filter(a => a.status === 'FIRING' && !a.acknowledged).length;

  return {
    tab, setTab,
    now, elapsed, clockHM,
    settings, setSettings,
    metrics, liqSpark, ticketSpark, sentimentSpark, btcSeries, feed,
    logs, addLog, toggleLog, removeLog,
    steps, advanceStep, resetSteps,
    alerts, setAlerts, activeAlerts,
    templates, setTemplates, selectedTemplateId, setSelectedTemplateId,
    sent, sendMessage,
    toasts, notify,
  };
}

type DashboardState = ReturnType<typeof useDashboardState>;

const DashboardContext = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const state = useDashboardState();
  return <DashboardContext.Provider value={state}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider');
  return ctx;
}
