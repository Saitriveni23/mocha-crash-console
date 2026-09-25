export type NavigationTab =
  | 'Overview'
  | 'Live Feeds'
  | 'Alerts'
  | 'Communications'
  | 'Incident Log'
  | 'Templates'
  | 'Settings';

export type CoinType = 'btc' | 'eth' | 'sol' | 'bnb' | 'xrp';

export interface MarketPair {
  symbol: string;
  coin: CoinType;
  price: number;
  changePercent: number;
  volume24h: string;
  high24h: number;
  low24h: number;
}

export interface LiquidationRow {
  pair: string;
  amount: string;
  delta: string;
  iconType: CoinType;
  volume: number;
}

export type StepStatus = 'In progress' | 'Pending' | 'Completed';

export interface IncidentStep {
  step: number;
  title: string;
  desc: string;
  status: StepStatus;
  iconType: 'monitoring' | 'communication' | 'stabilization' | 'review';
}

export type LogCategory = 'Market' | 'Support' | 'Comms' | 'Ops' | 'Pending';

export interface IncidentLogItem {
  id: string;
  time: string;
  text: string;
  category: LogCategory;
  status: 'done' | 'pending';
  author?: string;
  notes?: string;
}

export type TemplateCategory = 'Critical' | 'Support' | 'Recovery' | 'Advisory';

export interface CommunicationTemplate {
  id: string;
  title: string;
  content: string;
  category: TemplateCategory;
  channels: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  shortName: string;
  role: string;
  status: 'Online' | 'Active' | 'Away';
  avatar: string;
  isCurrentUser?: boolean;
}

export interface RegionalHotspot {
  id: string;
  city: string;
  country: string;
  label: string;
  type: 'liquidation' | 'sentiment' | 'tickets';
  density: 'High' | 'Medium' | 'Extreme';
  lon: number;
  lat: number;
  stat: string;
}

export interface AlertRule {
  id: string;
  name: string;
  threshold: string;
  metric: string;
  status: 'FIRING' | 'NORMAL' | 'PAUSED';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  lastTriggered: string;
  acknowledged?: boolean;
}

export interface LiveTradeFeedItem {
  id: string;
  time: string;
  pair: string;
  type: 'LIQUIDATION' | 'SELL' | 'BUY';
  amount: string;
  price: string;
  value: string;
  sourceHub: string;
}

export interface SentMessage {
  id: string;
  time: string;
  title: string;
  channels: string[];
  audience: string;
  reach: number;
}

export interface Toast {
  id: string;
  title: string;
  tone: 'success' | 'info' | 'danger';
}
