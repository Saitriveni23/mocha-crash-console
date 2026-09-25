import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ALERT_RULES,
  BTC_CRASH_DATA,
  COMMUNICATION_TEMPLATES,
  INITIAL_INCIDENT_LOG,
  INITIAL_INCIDENT_STEPS,
  INITIAL_RESPONSE_ACTIONS,
  LIQUIDATION_SPARKLINE,
  LIVE_TRADES_FEED,
  RISK_ACTION_PLAN_STAGES,
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
  UserAlert,
  RiskScoreReport,
  ResponseAction,
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
const SCENARIO_START = new Date(2026, 3, 25, 10, 47, 0).getTime();
const INITIAL_ELAPSED = 12 * 60 + 34;
const INITIAL_METRICS = { liquidations: 12842, tickets: 1248, sentiment: -72, btcPrice: 61482.32, priceDeviation: 0.84, oracleHealth: 96 };

const HUBS = ['NY Hub', 'London', 'Tokyo', 'Singapore', 'Frankfurt', 'São Paulo'];
const FEED_PAIRS = [
  { pair: 'BTC/USDT', unit: 'BTC', price: 61482, qty: [5, 220] },
  { pair: 'ETH/USDT', unit: 'ETH', price: 2841, qty: [80, 1500] },
  { pair: 'SOL/USDT', unit: 'SOL', price: 134, qty: [900, 14000] },
  { pair: 'BNB/USDT', unit: 'BNB', price: 532, qty: [100, 2000] },
];

// TCS personal price-alert simulation (Layer 1: individual user protection)
export const TCS_REFERENCE = 3120;
export const TCS_WARNING_BAND = 25;
const initialTcs = () => ({
  price: TCS_REFERENCE,
  volume: 12_400,
  history: [{ t: '10:47:00', price: TCS_REFERENCE }],
});

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const uid = () => Math.random().toString(36).slice(2, 9);

const TABS: NavigationTab[] = ['Overview', 'Market Monitor', 'Live Feeds', 'Alerts', 'Communications', 'Incident Log', 'Templates', 'Settings'];
const toSlug = (t: NavigationTab) => t.toLowerCase().replaceAll(' ', '-');
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
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [activeUserId, setActiveUserId] = useState('m1');

  const [settings, setSettings] = useState<Settings>({
    live: true,
    speedMs: 2500,
    liquidationThreshold: 5000,
    ticketThreshold: 500,
    sentimentThreshold: -50,
    channels: { 'Twitter/X': true, 'In-App Banner': true, Email: true, Telegram: false, 'Status Page': true, 'Help Center': true },
    compactMode: false,
  });

  const [metrics, setMetrics] = useState(INITIAL_METRICS);
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
  const [responseActions, setResponseActions] = useState(INITIAL_RESPONSE_ACTIONS);

  const [tcs, setTcs] = useState(initialTcs);
  const [tcsThreshold, setTcsThresholdState] = useState(3000);
  const [userAlerts, setUserAlerts] = useState<UserAlert[]>([]);
  const tcsPriceRef = useRef(TCS_REFERENCE);
  const tcsThresholdRef = useRef(3000);
  const alertFlagsRef = useRef({ warning: false, critical: false });
  const checkThresholdRef = useRef<() => void>(() => {});

  // One-second clock: drives the header time and the "since anomaly" timer
  useEffect(() => {
    if (!simulationRunning) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [simulationRunning]);

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
    if (!settings.live || !simulationRunning) return;
    const id = setInterval(() => {
      const t = clockHMSRef.current;
      setMetrics(m => ({
        liquidations: Math.max(0, Math.round(m.liquidations + (Math.random() - 0.35) * 420)),
        tickets: Math.max(0, Math.round(m.tickets + (Math.random() - 0.35) * 46)),
        sentiment: Math.max(-99, Math.min(20, Math.round(m.sentiment + (Math.random() - 0.55) * 3))),
        btcPrice: Math.max(55000, +(m.btcPrice + (Math.random() - 0.55) * 120).toFixed(2)),
        priceDeviation: Math.max(0, Math.min(5, +(m.priceDeviation + (Math.random() - 0.52) * 0.12).toFixed(2))),
        oracleHealth: Math.max(0, Math.min(100, Math.round(m.oracleHealth + (Math.random() - 0.55) * 2))),
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
      // Keeps sliding during the crash, with small relief bounces once it's well below the reference
      const prev = tcsPriceRef.current;
      const price = Math.round(prev - (prev > 2750 ? 10 + Math.random() * 40 : (Math.random() - 0.5) * 30));
      tcsPriceRef.current = price;
      setTcs(p => ({ price, volume: p.volume + Math.round(2000 + Math.random() * 8000), history: [...p.history, { t, price }].slice(-40) }));
      checkThresholdRef.current();
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
  }, [settings.live, settings.speedMs, simulationRunning]);

  const addUserAlert = useCallback((type: UserAlert['type'], message: string, price: number, threshold: number) => {
    setUserAlerts(a => [{ id: uid(), time: clockRef.current, asset: 'TCS', type, message, price, threshold }, ...a]);
  }, []);

  const dismissUserAlert = useCallback((id: string) => setUserAlerts(a => a.filter(x => x.id !== id)), []);

  const resetTcs = useCallback(() => {
    tcsPriceRef.current = TCS_REFERENCE;
    alertFlagsRef.current = { warning: false, critical: false };
    setTcs(initialTcs());
    setUserAlerts([]);
  }, []);

  const notify = useCallback((title: string, tone: Toast['tone'] = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, title, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const startSimulation = useCallback(() => setSimulationRunning(true), []);
  const pauseSimulation = useCallback(() => setSimulationRunning(false), []);
  const advanceSimulation = useCallback((minutes = 10) => {
    setSimulationRunning(false);
    setTick(t => t + minutes * 60);
    setMetrics(m => ({
      ...m,
      liquidations: Math.min(20_000, m.liquidations + 520 + (Math.floor(m.liquidations / 1000) % 3) * 110),
      tickets: Math.min(2_000, m.tickets + 28 + (Math.floor(m.tickets / 100) % 3) * 8),
      sentiment: Math.max(-99, m.sentiment - 2),
      priceDeviation: Math.min(1.8, +(m.priceDeviation + 0.06).toFixed(2)),
      oracleHealth: Math.max(82, m.oracleHealth - 1),
    }));
    notify(`Simulation advanced ${minutes} minutes`, 'info');
  }, [notify]);
  const resetSimulation = useCallback(() => {
    setSimulationRunning(false);
    setTick(0);
    setMetrics(INITIAL_METRICS);
    setSteps(INITIAL_INCIDENT_STEPS);
    setResponseActions(INITIAL_RESPONSE_ACTIONS);
    resetTcs();
    notify('Simulation reset', 'info');
  }, [notify, resetTcs]);

  const addLog = useCallback((text: string, category: LogCategory, author = 'You (Team Lead)', status: IncidentLogItem['status'] = 'done', notes?: string) => {
    setLogs(l => [...l, { id: uid(), time: clockRef.current, text, category, status, author, notes }]);
  }, []);

  // Threshold engine: each level fires once per crossing and re-arms when the price recovers
  const checkThreshold = useCallback(() => {
    const price = tcsPriceRef.current;
    const limit = tcsThresholdRef.current;
    const flags = alertFlagsRef.current;
    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
    if (price < limit && !flags.critical) {
      alertFlagsRef.current = { warning: true, critical: true };
      addUserAlert('CRITICAL', 'TCS crossed below your configured threshold', price, limit);
      addLog(`User alert: TCS crossed below threshold (${fmt(price)})`, 'Market', 'Threshold Engine');
      notify('TCS crossed below your threshold', 'danger');
    } else if (price >= limit && price <= limit + TCS_WARNING_BAND && !flags.warning) {
      alertFlagsRef.current = { warning: true, critical: false };
      addUserAlert('WARNING', `TCS approaching your threshold (${fmt(limit)})`, price, limit);
      addLog(`User alert: TCS approaching threshold (${fmt(price)})`, 'Market', 'Threshold Engine');
      notify('TCS approaching your price threshold', 'info');
    } else if (price > limit + TCS_WARNING_BAND) {
      alertFlagsRef.current = { warning: false, critical: false };
    }
  }, [addUserAlert, addLog, notify]);

  useEffect(() => {
    checkThresholdRef.current = checkThreshold;
  }, [checkThreshold]);

  const setTcsThreshold = useCallback(
    (v: number) => {
      tcsThresholdRef.current = v;
      alertFlagsRef.current = { warning: false, critical: false };
      setTcsThresholdState(v);
      checkThreshold();
    },
    [checkThreshold],
  );

  const toggleLog = useCallback((id: string) => {
    setLogs(l => l.map(x => (x.id === id ? { ...x, status: x.status === 'done' ? 'pending' : 'done' } : x)));
  }, []);

  const removeLog = useCallback((id: string) => setLogs(l => l.filter(x => x.id !== id)), []);

  const updateResponseAction = useCallback((id: string, patch: Partial<ResponseAction>) => {
    const action = responseActions.find(item => item.id === id);
    if (!action) return;

    const owner = action.ownerId === 'm1' ? 'You (Team Lead)' : action.ownerId === 'm2' ? 'Arjun (Trading Ops)' : 'Meera (Customer Support)';
    const isCompleting = patch.status === 'Completed' && action.status !== 'Completed';
    const completedAction: ResponseAction = isCompleting
      ? { ...action, ...patch, status: 'Completed', completedAt: clockRef.current, evidence: patch.evidence ?? `Confirmed by ${owner} in the incident console.` }
      : { ...action, ...patch };
    const nextActions = responseActions.map(item => item.id === id ? completedAction : item);

    if (isCompleting) {
      addLog(`Completed response action: ${action.text}`, 'Ops', owner, 'done', completedAction.evidence);

      // A stage is unlocked only after every assigned action in that stage is complete.
      const stageComplete = nextActions.filter(item => item.stage === action.stage).every(item => item.status === 'Completed');
      if (stageComplete) {
        const stageOrder = ['Monitor & Validate', 'Containment', 'Stabilization', 'Recovery & Review'];
        const stageIndex = stageOrder.indexOf(action.stage);
        const nextStage = stageOrder[stageIndex + 1];
        const nextPending = nextStage ? nextActions.find(item => item.stage === nextStage && item.status === 'Pending') : undefined;
        if (nextPending) {
          nextPending.status = 'In progress';
          addLog(`Unlocked next response stage: ${nextStage}`, 'Ops', 'Risk Engine');
        }
        setSteps(current => {
          const stepIndex = Math.max(0, Math.min(current.length - 1, stageIndex));
          return current.map((step, index) => index === stepIndex
            ? { ...step, status: 'Completed' }
            : index === stepIndex + 1 && nextStage
              ? { ...step, status: 'In progress' }
              : step);
        });
      } else {
        // Keep one clearly prompted task at a time within the active stage.
        const nextSameStage = nextActions.find(item => item.stage === action.stage && item.status === 'Pending');
        if (nextSameStage) nextSameStage.status = 'In progress';
      }
    }

    setResponseActions(nextActions);
  }, [addLog, responseActions]);

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

  // Transparent weighted risk model. Each input is normalized to 0-100 before its weight is applied.
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const riskFactors = [
    {
      key: 'liquidations' as const,
      label: 'Liquidations',
      value: `${metrics.liquidations.toLocaleString('en-US')} / 60s`,
      riskScore: clamp((metrics.liquidations / Math.max(1, settings.liquidationThreshold)) * 100),
      weight: 25,
      explanation: `Compared with the ${settings.liquidationThreshold.toLocaleString('en-US')} / 60s threshold.`,
    },
    {
      key: 'priceDeviation' as const,
      label: 'Price deviation',
      value: `${metrics.priceDeviation.toFixed(2)}% vs index`,
      riskScore: clamp((metrics.priceDeviation / 1.5) * 100),
      weight: 20,
      explanation: '1.50% deviation is treated as the critical reference point.',
    },
    {
      key: 'oracleHealth' as const,
      label: 'Oracle health',
      value: `${metrics.oracleHealth}% healthy`,
      riskScore: clamp(100 - metrics.oracleHealth),
      weight: 20,
      explanation: 'Risk increases as oracle availability and freshness fall below 100%.',
    },
    {
      key: 'supportTickets' as const,
      label: 'Support tickets',
      value: `${metrics.tickets.toLocaleString('en-US')} / min`,
      riskScore: clamp((metrics.tickets / Math.max(1, settings.ticketThreshold)) * 100),
      weight: 15,
      explanation: `Compared with the ${settings.ticketThreshold.toLocaleString('en-US')} / min threshold.`,
    },
    {
      key: 'sentiment' as const,
      label: 'Sentiment analysis',
      value: `${metrics.sentiment}% net sentiment`,
      riskScore: clamp(-metrics.sentiment),
      weight: 20,
      explanation: 'Negative sentiment is converted directly into risk points.',
    },
  ];
  const riskScore = riskFactors.reduce((sum, factor) => sum + (factor.riskScore * factor.weight) / 100, 0);
  const riskLevel: RiskScoreReport['level'] = riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'ELEVATED' : 'NORMAL';
  // Action plans deliberately change only every 10 minutes, not on every metric tick.
  const planWindowSeconds = 10 * 60;
  const planStageIndex = Math.min(Math.floor((tick || 0) / planWindowSeconds), RISK_ACTION_PLAN_STAGES.length - 1);
  const planStage = RISK_ACTION_PLAN_STAGES[planStageIndex];
  const nextUpdateInSeconds = planStageIndex === RISK_ACTION_PLAN_STAGES.length - 1
    ? 0
    : planWindowSeconds - ((tick || 0) % planWindowSeconds);
  const severityAction = riskLevel === 'CRITICAL'
    ? 'Executive escalation is required now; activate the critical incident bridge.'
    : riskLevel === 'HIGH'
      ? 'Keep high-risk trading controls engaged until the score improves.'
      : riskLevel === 'ELEVATED'
        ? 'Keep the response team on watch and prepare to escalate if another signal worsens.'
        : 'No additional trading restriction is recommended while the score remains normal.';
  const actions = [severityAction, ...planStage.actions];
  const riskReport: RiskScoreReport = {
    score: Number(riskScore.toFixed(1)),
    level: riskLevel,
    factors: riskFactors.map(factor => ({ ...factor, contribution: Number(((factor.riskScore * factor.weight) / 100).toFixed(1)) })),
    actions,
    summary: `${planStage.summary} Current severity is ${riskLevel.toLowerCase()}.`,
    generatedAt: clockHM,
    phase: planStage.phase,
    nextUpdateInSeconds,
  };

  return {
    tab, setTab,
    now, elapsed, simulationElapsed: tick, clockHM,
    settings, setSettings,
    metrics, liqSpark, ticketSpark, sentimentSpark, btcSeries, feed, riskReport,
    simulationRunning, startSimulation, pauseSimulation, advanceSimulation, resetSimulation,
    activeUserId, setActiveUserId,
    logs, addLog, toggleLog, removeLog,
    steps, advanceStep, resetSteps,
    responseActions, updateResponseAction,
    alerts, setAlerts, activeAlerts,
    templates, setTemplates, selectedTemplateId, setSelectedTemplateId,
    sent, sendMessage,
    toasts, notify,
    tcs, tcsThreshold, setTcsThreshold, userAlerts, dismissUserAlert, resetTcs,
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
