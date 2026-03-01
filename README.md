# 🏛️ Project Samvaad

> **Youth-Led Civic Complaint Tracking & Accountability Platform for Mumbai Metropolitan Region**

Built for **Samadhan 2026 Inter-Collegiate Social Ideathon** — Problem Statement ID: 0003, Blue Ribbon Movement (BRM).

---

## 🎯 Problem Statement

Citizens across the Mumbai Metropolitan Region face persistent civic issues (garbage, potholes, water supply, drainage, street lighting) but lack a unified, transparent platform to file complaints, track resolutions, and hold authorities accountable.

## 💡 Solution

**Samvaad** is a Progressive Web App (PWA) that connects **Citizens**, **Youth Volunteers**, and **NGO Admins** in a transparent, geotagged civic complaint tracking pipeline:

| Role | Key Features |
|------|-------------|
| **Citizen** | File geotagged complaints with photos/videos, track status progress, receive SLA notifications |
| **Volunteer** | Self-assign tasks, perform field verification, add follow-up notes, escalate delays |
| **Admin** | Dashboard analytics, volunteer management, complaint oversight, social media intelligence |

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** (App Router) | React framework with server/static rendering |
| **TypeScript** | Type safety across the entire codebase |
| **Tailwind CSS v4** | Utility-first styling |
| **Zustand** | Lightweight state management with persist middleware |
| **IndexedDB** (via `idb`) | Offline-first local storage with 7 object stores |
| **Leaflet + react-leaflet** | Interactive complaint maps with OpenStreetMap |
| **Recharts** | Analytics charts (pie, bar, area, trend) |
| **Service Worker** | Offline caching, background sync, push notifications |
| **Browser APIs** | Geolocation, Camera (MediaCapture), Notifications |

## 📁 Project Structure

```
prototype/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   └── icons/                 # App icons
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (PWA meta, fonts)
│   │   ├── page.tsx           # Login / role-selection landing
│   │   ├── globals.css        # Global styles
│   │   ├── citizen/           # Citizen portal (5 pages)
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── complaints/    # List + detail views
│   │   │   └── new-complaint/ # Complaint filing form
│   │   ├── volunteer/         # Volunteer portal (4 pages)
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── tasks/         # Task list + detail
│   │   │   └── verify/        # Field verification
│   │   └── admin/             # Admin portal (5 pages)
│   │       ├── page.tsx       # Dashboard overview
│   │       ├── complaints/    # All complaints management
│   │       ├── volunteers/    # Volunteer management
│   │       ├── analytics/     # Full analytics suite
│   │       └── social/        # Social media intelligence
│   ├── components/
│   │   ├── Navbar.tsx         # Responsive navigation with role-based menus
│   │   ├── ComplaintCard.tsx   # Complaint display cards
│   │   ├── ComplaintMap.tsx    # Leaflet map with geotagged markers
│   │   ├── Charts.tsx         # Recharts dashboard visualizations
│   │   ├── MediaCapture.tsx   # Geotagged photo/video capture
│   │   ├── ui.tsx             # Reusable UI primitives
│   │   └── ServiceWorkerRegistration.tsx
│   ├── db/
│   │   ├── schema.ts          # IndexedDB schema (7 stores)
│   │   └── operations.ts      # CRUD operations
│   ├── lib/
│   │   ├── auth-store.ts      # Authentication state (3 demo users)
│   │   ├── complaint-store.ts # Complaint state management
│   │   ├── seed-data.ts       # 12 realistic demo complaints
│   │   ├── geolocation.ts     # Browser Geolocation API wrapper
│   │   ├── media-capture.ts   # Camera + geotagging utilities
│   │   ├── sync.ts            # Offline sync + connectivity
│   │   ├── analytics.ts       # Analytics computation helpers
│   │   └── constants.ts       # MMR wards, categories, configs
│   └── types/
│       └── index.ts           # All TypeScript interfaces
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
cd prototype
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📱 Demo Accounts

The prototype includes three pre-configured demo users accessible from the landing page:

| Role | Name | Description |
|------|------|-------------|
| 🏠 Citizen | Ramesh Patil | File and track complaints |
| 🤝 Volunteer | Priya Sharma | Verify and resolve complaints |
| 🛡️ Admin | Dr. Anita Deshmukh | Full system oversight |

## 🌟 Key Features

### Offline-First Architecture
- IndexedDB stores all data locally
- Service Worker caches pages + assets for offline access
- Background sync queues submissions when offline

### Geotagged Complaints
- Browser Geolocation API captures exact coordinates
- Leaflet map visualizes all complaints across MMR
- Location validation ensures complaints are within MMR boundaries

### RBAC (Role-Based Access Control)
- Three distinct roles with separate dashboards
- Auth guards protect role-specific routes
- Demo role-switcher for easy testing

### Real-Time Analytics
- Status distribution, category breakdown, area heatmaps
- SLA compliance tracking with overdue alerts
- 30-day complaint filing/resolution trends

### Social Media Intelligence (Admin)
- Monitors Twitter, WhatsApp groups, and news sources
- Sentiment analysis (positive/negative/neutral)
- Link social posts to existing complaints

## 📊 Data Sources

The prototype is informed by **102 survey responses** (included in `Civic_Survey_Data_Final_Updated.csv`) from residents across MMR and Pune, covering:
- Civic issue types and frequency
- Complaint filing behavior
- Technology preferences
- Satisfaction with current services

## 🏗️ Architecture Decisions

1. **Next.js App Router** — Modern React patterns with built-in file-based routing
2. **Zustand over Redux** — Minimal boilerplate, built-in persist middleware
3. **IndexedDB over localStorage** — Structured data, larger storage, indexes
4. **Static generation** — Most pages pre-rendered for instant loads
5. **Dynamic imports** — Leaflet loaded client-side only (no SSR)

## 📋 Alignment with Problem Statement

| Requirement | Implementation |
|------------|---------------|
| Geotagged digital evidence | ✅ Browser geolocation + camera capture |
| Offline-first PWA | ✅ IndexedDB + Service Worker + cache strategies |
| Civic dashboard | ✅ Role-specific dashboards with analytics |
| RBAC for 3 roles | ✅ Citizen, Volunteer, Admin with route guards |
| Social media integration | ✅ Admin social intelligence feed |
| SLA tracking | ✅ Per-complaint SLA with overdue warnings |
| Volunteer management | ✅ Assignment, verification, escalation workflows |

---

**Team:** Built for Samadhan 2026 Inter-Collegiate Social Ideathon by SFIT  
**Problem Statement:** ID 0003 — Blue Ribbon Movement (BRM)
