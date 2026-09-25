# MochaTrade: Flash-Crash Ops Console & Personal Alert System

A premium, interactive fintech dashboard designed for the **MochaTrade** competition. This prototype addresses **Track 3: The Flash-Crash Simulation**, demonstrating how an operations team handles extreme market volatility, whilst additionally introducing a **Real-Time Market Monitoring and Personalized Threshold Alert System** for individual users (Layer 1 vs Layer 2 incident logic).

## ✨ New Major Feature: Market Monitor & Threshold Engine

The newest addition to the dashboard connects individual user protection with platform-level incident response.
- **TCS Market Simulation**: Observe a real-time price feed for TCS stock, charted against your alert threshold.
- **Automated User Alerts (Layer 1)**: The system tracks a user-defined threshold (default TCS price < ₹3,000, editable on the page). As the simulated market crashes, it triggers localized `WARNING` (approaching threshold) and `CRITICAL` (crossed threshold) alerts.
- **Platform Incident Context (Layer 2)**: The system clearly contrasts individual user alerts with the broader systemic impact, monitoring massive liquidation spikes and support queue timeouts concurrently.
- **No Autonomous Execution**: Emphasizing intelligent monitoring over robotic trading, the system alerts the user and provides actionable paths (`[View Market Data]`, `[Dismiss]`) rather than executing forced buy/sell orders.

## ✨ Flash-Crash Ops Console

A dark neon incident-response dashboard. Every page shares one live-simulated incident, so actions on one page show up on the others.

- **Overview**: Flash-crash banner with a live "since anomaly" timer, response status, liquidation / support-ticket / sentiment sparklines, BTC price chart with a regional hotspot map, key alerts, top liquidations, incident log, quick actions and team view.
- **Market Monitor**: The TCS personal threshold alerts described above.
- **Live Feeds**: Price ticker, per-pair price and volume chart, streaming trade feed (filter / pause), clickable regional hotspots and liquidation volume by pair.
- **Alerts**: Threshold rules that fire from live metrics; acknowledge, escalate or pause them; alert volume chart and escalation chain.
- **Communications**: Pick a pre-approved template, edit it, choose audience and channels, preview it as an X post, in-app banner or email, then confirm and send.
- **Incident Log**: Response stages, a searchable and filterable timeline, add / delete / resolve entries, category breakdown and Markdown export.
- **Templates**: Search, filter, create, copy, delete, or send a template straight to Communications.
- **Settings**: Live-stream on/off and speed, alert thresholds, which channels Communications may use, compact tables.

Pages are deep-linkable (e.g. `/#market-monitor`) and the layout works down to phone width.

## 🚀 Getting Started

This prototype is built using React, Vite, Tailwind CSS v4, and Recharts.

### Prerequisites

Ensure you have Node.js installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Saitriveni23/mocha-crash-console.git
   ```
2. Navigate to the project directory:
   ```bash
   cd mocha-crash-console
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the Vite development server to view the dashboard locally:

```bash
npm run dev
```

The application will typically run on `http://localhost:5173` (or the next available port).
