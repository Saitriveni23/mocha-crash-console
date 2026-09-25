# MochaTrade: Flash-Crash Ops Console (Track 3 Prototype)

A premium, interactive fintech operations dashboard designed for the **MochaTrade** Round 2 Case Competition. This prototype specifically addresses **Track 3: The Flash-Crash Simulation**, demonstrating how an operations team would handle extreme market volatility using a modern, user-friendly interface.

## ✨ Features

- **Real-Time Simulation**: Hit the "Run Flash-Crash Scenario" button to start a live simulation injecting simulated volatility, liquidations, and support ticket spikes directly into the dashboard metrics and charts.
- **Dynamic Double Area Chart**: Real-time visualization of incoming support tickets vs. market liquidations during the crash.
- **Tabbed Ops Interface**:
  - **Decision Log**: An automated timeline of system warnings and manual team actions.
  - **Team Chat**: A simulated internal collaboration feed where your CTO and Risk Lead drop updates as the crisis unfolds.
  - **Social Sentiment**: A live feed of user reactions (from panic to neutral) that updates as market conditions change.
- **Editable Incident Communications**: Select from pre-approved communication templates (Twitter, In-App, Email), customize the draft in the live text editor, and dispatch them directly to the social feed.
- **Post-Incident Reporting**: A dedicated "Reports" tab that automatically generates a Flash-Crash Post-Mortem, summarizing peak incident metrics and timeline decisions for executive review.
- **Premium Pastel Glassmorphism UI**: Completely breaks away from the generic dark-mode trading terminal trope. Features an elegant Apple/Linear/Notion-inspired design with warm ivory backgrounds, soft pastel gradients, rounded glass cards, and organic mountain illustrations.

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

## 🛠️ Technology Stack

- **React 18**
- **Vite**
- **Tailwind CSS v4** (for rapid, modern styling and glassmorphism effects)
- **Recharts** (for the dynamic double area chart)
- **Lucide React** (for beautiful, consistent iconography)

## 🎨 Design System

- **Background**: Warm Ivory (`#FFF8F3`) with `mix-blend-multiply` gradient blobs.
- **Cards**: `bg-white/60` with `backdrop-blur-xl` and subtle borders to create a premium frosted glass effect.
- **Accents**: 
  - System Health / Dashboard: Sage Mint (`#D7F5E8`)
  - Liquidations / Live Markets: Rose Pink (`#F7B6C2`)
  - Volatility / Incidents: Amber (`#FFE8A3`)
  - System Load / Reports: Lavender (`#E8DDFD`)
  - Communications / Tickets: Peach Coral (`#FFD9C8`)
