# MochaTrade: Flash-Crash Ops Console & Personal Alert System

A premium, interactive fintech dashboard designed for the **MochaTrade** competition. This prototype addresses **Track 3: The Flash-Crash Simulation**, demonstrating how an operations team handles extreme market volatility, whilst additionally introducing a **Real-Time Market Monitoring and Personalized Threshold Alert System** for individual users (Layer 1 vs Layer 2 incident logic).

## ✨ New Major Feature: Market Monitor & Threshold Engine

The newest addition to the dashboard connects individual user protection with platform-level incident response.
- **TCS Market Simulation**: Observe a real-time price feed for TCS stock.
- **Automated User Alerts (Layer 1)**: The system tracks user-defined thresholds (e.g., TCS price < ₹3,000). As the simulated market crashes, it triggers localized `WARNING` (approaching threshold) and `CRITICAL` (crossed threshold) alerts.
- **Platform Incident Context (Layer 2)**: The system clearly contrasts individual user alerts with the broader systemic impact, monitoring massive liquidation spikes and support queue timeouts concurrently.
- **No Autonomous Execution**: Emphasizing intelligent monitoring over robotic trading, the system alerts the user and provides actionable paths (`[View Market Data]`, `[Dismiss]`) rather than executing forced buy/sell orders.

## ✨ Original Flash-Crash Ops Features

- **Real-Time Simulation**: Hit "Run Crash Simulation" to inject volatility, liquidations, and support ticket spikes into the dashboard metrics.
- **Dynamic Charting**: Real-time visualization of incoming support tickets vs. market liquidations during the crash.
- **Tabbed Ops Interface**: Decision Log, Team Chat (simulated CTO/Risk inputs), and Social Sentiment feeds.
- **Editable Incident Communications**: Customize pre-approved communication templates and dispatch them.
- **Post-Incident Reporting**: Automatically generates an exportable Flash-Crash Post-Mortem.
- **Premium Pastel UI + Dark Mode**: An elegant Apple/Linear-inspired design with warm ivory backgrounds, pastel gradients, and a gorgeous dark mode toggle.

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
