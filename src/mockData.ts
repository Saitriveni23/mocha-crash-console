import type {
  MarketPair,
  LiquidationRow, 
  IncidentStep, 
  IncidentLogItem, 
  TeamMember, 
  RegionalHotspot,
  CommunicationTemplate,
  AlertRule,
  LiveTradeFeedItem
} from './types';
import type { ResponseAction, RiskActionPlanStage } from './types';

// Deliberately staged response plans for the demo. The store advances one stage every 10 minutes.
export const RISK_ACTION_PLAN_STAGES: RiskActionPlanStage[] = [
  {
    phase: 'Monitor & Validate',
    summary: 'Early warning conditions are being validated against market, oracle, support, and sentiment signals.',
    actions: [
      'Increase monitoring frequency and confirm the five risk inputs are receiving fresh data.',
      'Review liquidity concentration and compare prices across venues.',
      'Prepare an internal advisory while keeping customer-facing controls unchanged.',
    ],
  },
  {
    phase: 'Containment',
    summary: 'Risk is persistent across multiple indicators. Containment controls should be prepared and coordinated.',
    actions: [
      'Reduce leverage limits and increase margin buffers for the most exposed pairs.',
      'Validate oracle freshness and route execution away from unhealthy venues.',
      'Prepare a customer advisory and keep the incident commander on call.',
    ],
  },
  {
    phase: 'Stabilization',
    summary: 'The incident requires active stabilization while the risk score remains elevated.',
    actions: [
      'Pause new high-risk leveraged positions and monitor liquidation queues closely.',
      'Apply circuit-breaker controls only to affected pairs and review their impact.',
      'Escalate unresolved support and execution issues to the operations lead.',
    ],
  },
  {
    phase: 'Recovery & Review',
    summary: 'Signals are being watched for sustained recovery before controls are gradually removed.',
    actions: [
      'Restore limits in phases only after oracle health and price spreads remain stable.',
      'Send an all-clear update when the score stays below the recovery threshold.',
      'Record affected executions and complete the post-incident review.',
    ],
  },
];

export const INITIAL_RESPONSE_ACTIONS: ResponseAction[] = [
  { id: 'action-1', text: 'Validate oracle freshness and cross-exchange price divergence', ownerId: 'm2', status: 'In progress', stage: 'Monitor & Validate' },
  { id: 'action-2', text: 'Review abnormal liquidation clusters and affected positions', ownerId: 'm2', status: 'Pending', stage: 'Containment' },
  { id: 'action-3', text: 'Prepare and approve the customer volatility advisory', ownerId: 'm3', status: 'Pending', stage: 'Containment' },
  { id: 'action-4', text: 'Approve temporary leverage and margin controls', ownerId: 'm1', status: 'Pending', stage: 'Stabilization' },
  { id: 'action-5', text: 'Confirm recovery conditions and record the post-incident review', ownerId: 'm1', status: 'Pending', stage: 'Recovery & Review' },
];

export const TEAM_WORKLOAD = [
  { memberId: 'm1', allocation: 40, focus: 'Command, approvals & escalation', queue: 'Decision ownership' },
  { memberId: 'm2', allocation: 35, focus: 'Oracle, liquidity & executions', queue: 'Market validation' },
  { memberId: 'm3', allocation: 25, focus: 'Customer support & broadcasts', queue: 'Comms and ticket triage' },
];

export const TOP_LIQUIDATIONS_DATA: LiquidationRow[] = [
  { pair: 'BTC/USDT', amount: '4,821.32M', delta: '+320%', iconType: 'btc', volume: 4821.32 },
  { pair: 'ETH/USDT', amount: '2,842.17M', delta: '+280%', iconType: 'eth', volume: 2842.17 },
  { pair: 'SOL/USDT', amount: '1,421.65M', delta: '+220%', iconType: 'sol', volume: 1421.65 },
  { pair: 'BNB/USDT', amount: '532.1M', delta: '+75%', iconType: 'bnb', volume: 532.1 },
];

export const INITIAL_INCIDENT_STEPS: IncidentStep[] = [
  { step: 1, title: 'Monitoring', desc: 'Real-time liquidity and risk monitoring', status: 'In progress', iconType: 'monitoring' },
  { step: 2, title: 'Communication', desc: 'Pre-approved broadcast to affected traders', status: 'In progress', iconType: 'communication' },
  { step: 3, title: 'Stabilization', desc: 'Circuit breakers & margin risk mitigation', status: 'Pending', iconType: 'stabilization' },
  { step: 4, title: 'Post-Incident Review', desc: 'Root cause analysis and audit logs', status: 'Pending', iconType: 'review' },
];

export const INITIAL_INCIDENT_LOG: IncidentLogItem[] = [
  { id: 'log-1', time: '10:42', text: 'Abnormal liquidations detected (12,842)', category: 'Market', status: 'done', author: 'Risk Engine Bot' },
  { id: 'log-2', time: '10:44', text: 'Support ticket volume spiked (1,248)', category: 'Support', status: 'done', author: 'Zendesk Relay' },
  { id: 'log-3', time: '10:46', text: 'Sent customer communication', category: 'Comms', status: 'done', author: 'You (Team Lead)' },
  { id: 'log-4', time: '10:48', text: 'Checked open positions & funding rates', category: 'Ops', status: 'pending', author: 'Arjun (Trading Ops)' },
  { id: 'log-5', time: '10:49', text: 'Check map for regional sentiment trends', category: 'Pending', status: 'pending', author: 'Meera (Customer Support)' },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'm1',
    name: 'You (Team Lead)',
    shortName: 'You',
    role: 'Lead Ops & Risk',
    status: 'Online',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isCurrentUser: true,
  },
  {
    id: 'm2',
    name: 'Arjun (Trading Ops)',
    shortName: 'Arjun',
    role: 'Quantitative Risk Analyst',
    status: 'Online',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'm3',
    name: 'Meera (Customer Support)',
    shortName: 'Meera',
    role: 'Incident Comms Lead',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

export const REGIONAL_HOTSPOTS: RegionalHotspot[] = [
  {
    id: 'h-ny',
    city: 'NY Hub',
    country: 'United States',
    label: 'High Liquidation Density',
    type: 'liquidation',
    density: 'Extreme',
    lon: -74,
    lat: 40.7,
    stat: '$2,140M Liquidated',
  },
  {
    id: 'h-london',
    city: 'London',
    country: 'United Kingdom',
    label: 'Sharp Sentiment Drop',
    type: 'sentiment',
    density: 'High',
    lon: -0.1,
    lat: 51.5,
    stat: '-78% Sentiment Panic',
  },
  {
    id: 'h-tokyo',
    city: 'Tokyo',
    country: 'Japan',
    label: 'Spike in Support Tickets',
    type: 'tickets',
    density: 'High',
    lon: 139.7,
    lat: 35.7,
    stat: '420 Tickets/min',
  },
  {
    id: 'h-sg',
    city: 'Singapore',
    country: 'Singapore',
    label: 'Secondary Margin Spill',
    type: 'liquidation',
    density: 'Medium',
    lon: 103.8,
    lat: 1.3,
    stat: '$680M Liquidated',
  },
  {
    id: 'h-frankfurt',
    city: 'Frankfurt',
    country: 'Germany',
    label: 'API Gateway Latency',
    type: 'sentiment',
    density: 'Medium',
    lon: 8.7,
    lat: 50.1,
    stat: '98ms Avg Latency',
  },
  {
    id: 'h-sp',
    city: 'São Paulo',
    country: 'Brazil',
    label: 'BRL Spread Disparity',
    type: 'liquidation',
    density: 'Medium',
    lon: -46.6,
    lat: -23.5,
    stat: '$140M Cascaded',
  }
];

// Deterministic pseudo-random so the chart looks the same on every load
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// Minute-by-minute BTC price from 10:12 to 10:41: choppy drift, then the crash
export const BTC_CRASH_DATA = Array.from({ length: 30 }).map((_, i) => {
  const minute = 12 + i;
  const drift = 67600 - i * 95;
  const noise = (seeded(i) - 0.5) * 520;
  const crash = i > 24 ? (i - 24) ** 2 * 120 : 0;
  const price = i === 29 ? 61482.32 : Math.round(drift + noise - crash);
  return {
    time: `10:${String(minute).padStart(2, '0')}`,
    price,
    volume: Math.round(200 + seeded(i + 100) * 300 + (i > 24 ? (i - 24) * 520 : 0)),
  };
});

export const MARKET_PAIRS: MarketPair[] = [
  { symbol: 'BTC/USDT', coin: 'btc', price: 61482.32, changePercent: -8.41, volume24h: '48.2B', high24h: 67912, low24h: 61120 },
  { symbol: 'ETH/USDT', coin: 'eth', price: 2841.5, changePercent: -11.2, volume24h: '21.7B', high24h: 3218, low24h: 2802 },
  { symbol: 'SOL/USDT', coin: 'sol', price: 134.2, changePercent: -14.6, volume24h: '6.4B', high24h: 158.9, low24h: 131.4 },
  { symbol: 'BNB/USDT', coin: 'bnb', price: 532.1, changePercent: -6.3, volume24h: '2.9B', high24h: 571.2, low24h: 528.6 },
  { symbol: 'XRP/USDT', coin: 'xrp', price: 0.4812, changePercent: -9.8, volume24h: '3.1B', high24h: 0.5391, low24h: 0.4705 },
];

// Jagged, accelerating series for the KPI sparklines (24 samples, 10:17 → 10:40)
const sparkTime = (i: number) => `10:${String(17 + i).padStart(2, '0')}`;
const ramp = (i: number) => Math.pow(i / 23, 2.2);

export const LIQUIDATION_SPARKLINE = Array.from({ length: 24 }).map((_, i) => ({
  t: sparkTime(i),
  v: i === 23 ? 12842 : Math.round(1200 + ramp(i) * 11000 + (seeded(i + 7) - 0.5) * 1800),
}));

export const TICKET_SPARKLINE = Array.from({ length: 24 }).map((_, i) => ({
  t: sparkTime(i),
  v: i === 23 ? 1248 : Math.round(140 + ramp(i) * 1050 + (seeded(i + 31) - 0.5) * 170),
}));

export const SENTIMENT_SPARKLINE = Array.from({ length: 24 }).map((_, i) => ({
  t: sparkTime(i),
  sentiment: i === 23 ? -72 : Math.round(45 - ramp(i) * 115 + (seeded(i + 53) - 0.5) * 22),
  liquidation: Math.round(20 + ramp(i) * 75 + (seeded(i + 71) - 0.5) * 18),
  ticket: Math.round(10 + ramp(i) * 80 + (seeded(i + 97) - 0.5) * 16),
}));

export const COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 't-flash-halt',
    title: 'Market Volatility & Margin Trading Pause',
    category: 'Critical',
    channels: ['Twitter/X', 'In-App Banner', 'Email', 'Telegram', 'Status Page'],
    content: 'We have temporarily paused leveraged margin trading and adjusted maintenance margins due to sudden elevated volatility across major pairs (BTC, ETH, SOL). All spot trading, fiat withdrawals, and user balances remain fully secure. Our risk engineering team is actively managing orderly execution.',
  },
  {
    id: 't-support-surge',
    title: 'High Support Ticket Volume Advisory',
    category: 'Support',
    channels: ['In-App Banner', 'Help Center', 'Twitter/X'],
    content: 'Our customer support team is currently handling high ticket volumes due to market-wide price swings. Automated liquidations occurred in compliance with pre-set liquidation buffer rules. Please refer to your trade execution logs. Response times may temporarily take up to 15-20 minutes.',
  },
  {
    id: 't-all-clear',
    title: 'Platform Stabilization & All-Clear Update',
    category: 'Recovery',
    channels: ['Twitter/X', 'Email', 'In-App Banner', 'Status Page'],
    content: 'Market conditions across all major pairs have returned to nominal spreads. Funding rates and margin trading limits are being progressively restored in phased intervals. Circuit breakers have disengaged successfully. Zero unintended bad debt has been incurred by the MochaTrade insurance fund.',
  },
  {
    id: 't-liquidation-review',
    title: 'Abnormal Liquidations Incident Notice',
    category: 'Advisory',
    channels: ['In-App Notification', 'Email'],
    content: 'We are conducting an in-depth operational review of the rapid cascade between 10:32 AM and 10:41 AM. Any orders impacted by off-market oracle latency spikes will be reviewed by the MochaTrade User Protection & Compensation Desk.',
  }
];

export const ALERT_RULES: AlertRule[] = [
  {
    id: 'ar-1',
    name: 'Rapid Liquidation Velocity Spike',
    threshold: '> 5,000 liquidations / 60s',
    metric: '12,842 (Current)',
    status: 'FIRING',
    severity: 'CRITICAL',
    lastTriggered: '10:40:12 AM',
  },
  {
    id: 'ar-2',
    name: 'Support Ticket Velocity Anomaly',
    threshold: '> 500 new tickets / min',
    metric: '1,248 (Current)',
    status: 'FIRING',
    severity: 'WARNING',
    lastTriggered: '10:38:45 AM',
  },
  {
    id: 'ar-3',
    name: 'Social Sentiment Panic Threshold',
    threshold: '< -50% net negative sentiment',
    metric: '-72% (Current)',
    status: 'FIRING',
    severity: 'CRITICAL',
    lastTriggered: '10:34:18 AM',
  },
  {
    id: 'ar-4',
    name: 'Cross-Exchange Oracle Price Divergence',
    threshold: '> 1.5% delta vs Index Price',
    metric: '0.84% (Within bounds)',
    status: 'NORMAL',
    severity: 'WARNING',
    lastTriggered: 'Yesterday 18:22 PM',
  },
  {
    id: 'ar-5',
    name: 'API Gateway Order Rate Limit',
    threshold: '> 95% maximum queue capacity',
    metric: '82% capacity',
    status: 'NORMAL',
    severity: 'INFO',
    lastTriggered: '2 days ago',
  }
];

export const LIVE_TRADES_FEED: LiveTradeFeedItem[] = [
  { id: 'f1', time: '10:47:22', pair: 'BTC/USDT', type: 'LIQUIDATION', amount: '184.50 BTC', price: '$61,480.00', value: '$11.34M', sourceHub: 'NY Hub' },
  { id: 'f2', time: '10:47:19', pair: 'ETH/USDT', type: 'LIQUIDATION', amount: '1,250.00 ETH', price: '$2,841.50', value: '$3.55M', sourceHub: 'London' },
  { id: 'f3', time: '10:47:15', pair: 'SOL/USDT', type: 'LIQUIDATION', amount: '12,400 SOL', price: '$134.20', value: '$1.66M', sourceHub: 'Tokyo' },
  { id: 'f4', time: '10:47:11', pair: 'BTC/USDT', type: 'SELL', amount: '45.12 BTC', price: '$61,495.10', value: '$2.77M', sourceHub: 'Frankfurt' },
  { id: 'f5', time: '10:47:08', pair: 'BNB/USDT', type: 'LIQUIDATION', amount: '1,890 BNB', price: '$532.10', value: '$1.00M', sourceHub: 'Singapore' },
  { id: 'f6', time: '10:47:04', pair: 'BTC/USDT', type: 'BUY', amount: '220.00 BTC', price: '$61,502.40', value: '$13.53M', sourceHub: 'NY Hub' },
  { id: 'f7', time: '10:46:58', pair: 'SOL/USDT', type: 'SELL', amount: '8,900 SOL', price: '$134.10', value: '$1.19M', sourceHub: 'London' },
  { id: 'f8', time: '10:46:51', pair: 'ETH/USDT', type: 'LIQUIDATION', amount: '640.00 ETH', price: '$2,839.90', value: '$1.81M', sourceHub: 'Tokyo' },
];
