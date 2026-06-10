# Incubein Analytics Dashboard

A unified social media analytics platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Shadcn UI**.

## ✨ Features

- **YouTube Analytics** — Views, subscribers, watch time & revenue tracking
- **LinkedIn Analytics** — Post impressions, engagement rate & audience demographics
- **Meta Analytics** — Unified Facebook & Instagram insights with platform tabs
- **Cross-Post Scheduler** — Multi-platform content scheduling with calendar view
- **Dark Mode Native** — Sleek dark theme with glassmorphism design
- **Responsive Layout** — Persistent sidebar + top navbar for authenticated areas

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework & Routing |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Shadcn UI | Component Library |
| Radix UI | Accessible Primitives |

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Marketing homepage
│   ├── auth/page.tsx       # Login/Register
│   └── (dashboard)/        # Authenticated route group
│       ├── layout.tsx      # Sidebar + Navbar layout
│       ├── youtube/        # YouTube analytics
│       ├── linkedin/       # LinkedIn analytics
│       ├── meta/           # Meta (FB/Insta) analytics
│       └── cross-post/     # Multi-platform scheduler
├── components/             # Shared UI components
│   ├── ui/                 # Shadcn UI primitives
│   ├── sidebar.tsx         # Dashboard sidebar
│   └── navbar.tsx          # Top navigation bar
├── lib/                    # Utilities (cn, formatters)
├── hooks/                  # Custom React hooks
└── types/                  # Global TypeScript interfaces
```

## 🚀 Getting Started

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📄 License

MIT
