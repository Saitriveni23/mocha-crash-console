# MochaTrade: Flash-Crash Ops Console & Personal Alert System

A premium, interactive fintech dashboard designed for the **MochaTrade** competition. This prototype addresses **Track 3: The Flash-Crash Simulation**, demonstrating how an operations team handles extreme market volatility, whilst additionally introducing a **Real-Time Market Monitoring and Personalized Threshold Alert System** for individual users (Layer 1 vs Layer 2 incident logic).

## ✨ New Major Feature: Market Monitor & Threshold Engine

The newest addition to the dashboard connects individual user protection with platform-level incident response.
- **TCS Market Simulation**: Observe a real-time price feed for TCS stock, charted against your alert threshold.
- **Automated User Alerts (Layer 1)**: The system tracks a user-defined threshold (default TCS price < ₹3,000, editable on the page). As the simulated market crashes, it triggers localized `WARNING` (approaching threshold) and `CRITICAL` (crossed threshold) alerts.
- **Platform Incident Context (Layer 2)**: The system clearly contrasts individual user alerts with the broader systemic impact, monitoring massive liquidation spikes and support queue timeouts concurrently.
- **No Autonomous Execution**: Emphasizing intelligent monitoring over robotic trading, the system alerts the user and provides actionable paths (`[View Market Data]`, `[Dismiss]`) rather than executing forced buy/sell orders.

## ✨ MochaTrade Executive AI Workspace

The dashboard features a completely custom, premium luxury UI inspired by an AI hedge fund operations desk.

- **Design Language**: Warm matte black (`#090807`), copper (`#B66A3C`), and champagne gold (`#D9A35E`) with cream text — avoiding generic hacker/neon tropes for a sophisticated Apple/Notion/Bloomberg Terminal hybrid feel.
- **Overview**: Executive dashboard with a live "since anomaly" timer, automated action plans, response status, liquidation / support-ticket / sentiment sparklines, BTC price chart with a regional hotspot map, key alerts, top liquidations, and team view.
- **Market Monitor**: The TCS personal threshold alerts described above, layered seamlessly into the platform's overarching UI.
- **Live Feeds**: Features a bespoke, fully responsive pure-SVG OHLC Candlestick Chart (with wicks, green/red candles, and crosshair hover tooltips), a streaming trade feed, clickable regional hotspots, and liquidation volume bars.
- **Incident Command Center (Alerts)**: Threshold rules that fire from live metrics; acknowledge, escalate, or resolve them; complete with an AI Oracle indicator and escalation chain.
- **Communications**: Pick a pre-approved template, edit it, choose audience and channels, preview it as an X post, in-app banner or email, then confirm and send.
- **Incident Log**: Response stages, a searchable and filterable timeline, add / delete / resolve entries, category breakdown and Markdown export.
- **Templates**: Search, filter, create, copy, delete, or send a template straight to Communications.
- **Settings**: Live-stream on/off and speed, alert thresholds, which channels Communications may use, AI model statuses (GPT-4o, Claude 3.5), and team visibility.

Pages are deep-linkable (e.g. `/#market-monitor`) and the layout gracefully scales down to phone width.

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
