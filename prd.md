# Product Requirement Document (PRD)
## ORBIT — Personal Progress Tracker

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target Release:** Web (Production PWA) & Android (APK / AAB)  
**Primary Reference:** `personal-progress-tracker.html`

---

## 1. Executive Summary & Product Vision

### 1.1 Executive Summary
**Orbit** is a personal progress tracking platform designed for desktop, web, and Android. It translates everyday responsibilities, routines, and aspirations into an interactive cosmic visualization where life categories orbit like celestial bodies and individual tasks illuminate like stars.

Orbit rejects generic, soulless checklist interfaces in favor of a cohesive, visually rewarding experience that balances rigorous hierarchical task management with aesthetic elegance, offline-first reliability, and seamless multi-device cloud synchronization.

### 1.2 Core Product Vision
- **Hierarchical Clarity:** Strict three-tier organizational structure: **Category → Subcategory → Task**.
- **Data-Driven Visualization:** An interactive, mathematically computed SVG orbital map dynamically animated based on actual user data.
- **Progress Evolution:** Progression through 6 cosmic stages (*Unlit* → *Spark* → *Ember* → *Glow* → *Radiance* → *Zenith*) reflected in both the central celestial core and overall telemetry.
- **True Multi-Platform Ecosystem:** Responsive modern web client (Next.js) coupled with a native-feeling Android application (React Native / Expo), driven by a unified backend (Supabase / PostgreSQL) with offline capability and JSON data portability.

---

## 2. Target Audience & User Personas

| Persona | Primary Goals | Key Pain Points |
| :--- | :--- | :--- |
| **The Self-Directed Learner** (e.g., University / Tech student) | Track multi-track curricula (college, competitive prep, side projects, DSA). | Generic habit apps lack hierarchical depth; todo lists become overwhelming quickly. |
| **The Balanced Professional** | Partition life domains (Career, Fitness, Creative, Personal Care) with clear boundaries. | Feeling fragmented; lack of bird's-eye perspective on which life areas are neglected. |
| **The Visual Habit Builder** | Experience tangible, joyful reinforcement as daily routines are completed. | Text-heavy checklist burnout; absence of aesthetic satisfaction upon task completion. |

---

## 3. Product Hierarchy & Information Architecture

### 3.1 Strict 3-Tier Hierarchy
```
Category (e.g., Morning Routine, Academics, Fitness)
  └── Subcategory (e.g., Nutrition, IIT Madras, Strength Training)
        └── Task (e.g., Drink 500ml water, Lecture 4 review, Bench press 4x8)
```

- **Category:** Top-level life domain. Possesses a distinct accent color, an orbit track in the visualization, an icon/symbol, and aggregate statistics.
- **Subcategory:** Contextual grouping within a domain. Possesses its own completion stats and task list.
- **Task:** Atomic actionable item. Holds text content, binary completion state (`done`), completed timestamp (`at`), and sort ordering.

---

## 4. Technical Architecture & Tech Stack

### 4.1 Technology Stack Matrix

```
┌────────────────────────────────────────────────────────┐
│                      Client Layer                      │
├────────────────────────────┬───────────────────────────┤
│          Web App           │        Android App        │
│   Next.js 16 (App Router)  │     React Native (Expo)   │
│   React 19 + TypeScript    │    TypeScript + NativeWind│
│   Tailwind CSS v4 + Motion │    react-native-svg       │
└─────────────┬──────────────┴─────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌────────────────────────────────────────────────────────┐
│                   Shared Client Core                   │
│   - Calculation Engine (Stats, Stages, Orbit math)     │
│   - Offline Sync Engine & Mutation Queue               │
│   - Local Persistence (IndexedDB / SQLite / Storage)   │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│                     Backend Layer                      │
│                  Supabase BaaS Platform                │
│   - PostgreSQL 15+ with Row Level Security (RLS)       │
│   - Supabase Auth (Email/Password, Session Refresh)    │
│   - Realtime Subscriptions (Multi-device sync)         │
│   - Secure Storage & JSON Data Export / Import         │
└────────────────────────────────────────────────────────┘
```

### 4.2 Stack Justification & Trade-Off Analysis
1. **Next.js (Web):** Provides optimal SSR/SSG rendering, SEO capability, modular routing, and immediate deployment capabilities to Vercel or Node environments.
2. **React Native with Expo (Android):** Single TypeScript codebase sharing validation, types, and mathematical orbital logic with the web client. Expo Application Services (EAS) delivers automated APK/AAB compilation for Google Play.
3. **Supabase (Backend):** Enterprise-grade PostgreSQL with automatic JSON APIs, granular Row Level Security (RLS), real-time WebSockets, and zero licensing friction under open-source/generous free tier limits.
4. **Offline-First Strategy:** Local-first state management allows zero-latency interaction even in airplane mode. Mutations are logged to an indexed queue and synchronized with Supabase upon reconnection via Last-Write-Wins (LWW) timestamp reconciliation.

---

## 5. Detailed Functional Specifications

### 5.1 Main Dashboard

#### 5.1.1 Orbital Progress Visualization
The orbital visualization is the central anchor of Orbit. It must not be a canned GIF, static image, or mock asset—it must be a dynamic SVG rendered from live application state.

- **Concentric Orbits:** Each Category receives an orbital ring with radius $R_i = R_{min} + \frac{i}{N-1} \cdot (R_{max} - R_{min})$.
- **Orbital Track Styling:**
  - Empty category: dashed faint stroke (`stroke-dasharray="3 7"`).
  - Populated category: subtle stroke backdrop (`opacity: 0.22`), overlaid with a bright progress arc calculated via `stroke-dasharray="${C * progress} ${C}"` rotated $-90^\circ$.
- **Celestial Stars (Tasks):**
  - Distributed uniformly along the orbit circumference at angle $\theta_j = \frac{2\pi j}{M}$.
  - **Completed Star:** Solid category accent color, glowing radial filter (`drop-shadow(0 0 4px ${color})`), scale pop animation on toggle.
  - **Pending Star:** Hollow ring with soft white stroke (`stroke="#fff" stroke-opacity="0.4"`).
- **Central Celestial Body:**
  - Radial solar gradient `#FFF6D6` → `#FFC95C` → `#E0892B`.
  - Base radius expands dynamically with overall percentage: $r = 14 + 30 \times p$.
  - Soft ambient corona/glow with SVG Gaussian blur filter (`stdDeviation="3"`), increasing in opacity as total completion rises.
- **Orbital Animation:**
  - Rings subtly counter-rotate with alternating directions ($(-1)^i$) and calibrated angular velocities to generate a living cosmos without inducing motion sickness.
  - Respects OS-level accessibility setting `prefers-reduced-motion`.

#### 5.1.2 Overall Statistics Display
- **Total Tasks:** Aggregated across all categories and subcategories.
- **Completed Tasks:** Filter count where `done === true`.
- **Pending Tasks:** Total minus completed.
- **Overall Percentage:** Calculated as $\text{round}\left(\frac{\text{Completed}}{\text{Total}} \times 100\right)$, defaulting to $0\%$ when total is $0$.

#### 5.1.3 Progress Stages
Orbit divides user completion into 6 distinct cosmic milestones:

| Stage Name | Percentage Threshold | Stage Subtitle / Motivational Copy | Visual State |
| :--- | :--- | :--- | :--- |
| **Unlit** | 0% (or no tasks) | *"The sky is waiting. Add a category and light your first star."* | Faint central ember, empty orbits, dark cosmic sky. |
| **Spark** | 1% – 24% | *"The first stars are catching light. Keep going."* | Initial stars glowing, delicate solar core illumination. |
| **Ember** | 25% – 49% | *"A warm glow is gathering at the center."* | Central core intensifies, category arcs visibly tracing. |
| **Glow** | 50% – 74% | *"Your sun is climbing. The orbits are filling in."* | Robust corona effect, vibrant multi-ring progress. |
| **Radiance** | 75% – 99% | *"Nearly there. Most of your sky is alight."* | Intense central luminescence, high star brightness. |
| **Zenith** | 100% | *"Every star is lit. Add new goals to keep orbiting."* | Maximum radiance, golden sky overlay, celebration halo. |

#### 5.1.4 Category Overview Cards
- Card header with category name and custom accent badge.
- Subcategory and task completion count summary (e.g., `3 subcategories · 8/10 done`).
- Animated progress bar filled with the category's distinct color.
- Mini preview list of up to 4 subcategories with individual percentage tags.
- Interactive click/tap transitioning into the **Category Detail View**.

#### 5.1.5 Task Stream Views
- **Up Next:** Lists pending tasks in order of creation/priority, with direct toggle checkmark and parent category/subcategory breadcrumbs.
- **Completed:** Lists recently completed items with timestamp display, category badges, and stacked category distribution bar.

---

### 5.2 Category, Subcategory & Task Management (CRUD)

#### 5.2.1 Categories
- **Create:** Modal or inline form specifying category name and color selection from curated cosmic palette (`#E0A030`, `#5FB3A5`, `#8E86E8`, `#E27D8E`, `#6FA0E8`, `#A9C25A`) or custom hex picker.
- **Update:** Edit title, re-assign color, or update display sort order.
- **Delete:** Protected deletion requiring explicit user confirmation dialog warning that all nested subcategories and tasks will be removed.

#### 5.2.2 Subcategories
- **Create:** Quick addition within parent category view.
- **Update:** Rename inline or modal.
- **Delete:** Cascade warning for nested tasks.

#### 5.2.3 Tasks
- **Create:** Fast inline input with immediate optimistic rendering and autofocus.
- **Toggle State:** Interactive circular checkmark with SVG stroke animation and instant particle/pop effect in orbital view.
- **Edit:** Inline text editing.
- **Delete:** Instant removal with undo toast notification.

---

### 5.3 Authentication, Security & Multi-Device Sync

#### 5.3.1 User Authentication
- Email + password registration and sign-in via Supabase Auth.
- Secure HTTP-only cookies / encrypted AsyncStorage session storage.
- Password reset and recovery flow via email verification link.
- Guest / Offline mode: Users can begin using the application locally immediately without an account; seamless migration prompt allows syncing local state to an account upon registration.

#### 5.3.2 Cloud Synchronization & Offline Engine
- **Local Storage / Cache:** IndexedDB (web) and SQLite / AsyncStorage (Android).
- **Mutation Queue:** When network connection is unavailable, mutations (`CREATE_TASK`, `TOGGLE_TASK`, etc.) are appended to an ordered local queue with client timestamps (`client_updated_at`).
- **Sync Protocol:**
  1. On connectivity restoration, the sync engine dispatches pending mutations.
  2. Server resolves records using standard Last-Write-Wins (LWW) conflict policy.
  3. Realtime Supabase channels notify other active devices to refresh their local store.
- **Connectivity Badging:** Subtle visual indicator in header demonstrating status: *Online & Synced*, *Syncing...*, or *Offline (Changes saved locally)*.

#### 5.3.3 Backup, Restore & Data Portability
- **JSON Export:** Download full tracker state as a structured, human-readable JSON file timestamped `orbit-progress-YYYY-MM-DD.json`.
- **JSON Import:** 
  - Strict JSON schema validation against `OrbitExportSchema`.
  - Confirmation modal offering two modes: **Replace Current Data** or **Merge with Existing**.
  - Safe rollback and explicit error reporting if the file structure is corrupt or incompatible.

---

## 6. Database Schema Design (PostgreSQL / Supabase)

```sql
-- Profiles table linked to Supabase Auth
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  theme_preference text default 'dark' check (theme_preference in ('light', 'dark', 'system')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Categories table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 60),
  color text not null default '#E0A030',
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Subcategories table
create table public.subcategories (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 60),
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  subcategory_id uuid references public.subcategories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null check (char_length(trim(text)) > 0 and char_length(text) <= 250),
  done boolean default false not null,
  completed_at timestamptz,
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.tasks enable row level security;

create policy "Users own profiles" on public.profiles for all using (auth.uid() = id);
create policy "Users own categories" on public.categories for all using (auth.uid() = user_id);
create policy "Users own subcategories" on public.subcategories for all using (auth.uid() = user_id);
create policy "Users own tasks" on public.tasks for all using (auth.uid() = user_id);
```

---

## 7. Design System & Visual Specification

### 7.1 Typography
- **Headings & Key Accents:** `Fraunces`, variable optical size, weights 400 & 600. Evokes literary warmth, celestial timelessness, and elegance.
- **Body, UI & Numerical Telemetry:** `Manrope`, weights 400, 500, 600, 700. Clean, highly legible geometric sans-serif optimized for numerical metrics and micro-labels.

### 7.2 Color System & Theming

| Token | Light Theme Value | Dark Theme Value (Primary) | Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#EDEFF5` (Soft Lavender-Grey) | `#0F0E1F` (Midnight Purple) | Canvas base |
| `--card` | `#FBFBFE` (Warm Alabaster) | `#1A1833` (Deep Cosmic Indigo) | Cards, modals, drawers |
| `--ink` | `#1D1B3A` (Deep Obsidian Navy) | `#ECEAFB` (Soft Starlight White) | Primary typography |
| `--mute` | `#6C6A8A` (Dusk Indigo) | `#9895BC` (Muted Starlight Slate) | Secondary labels, timestamps |
| `--line` | `#DAD9E8` (Faint Violet Border) | `#2D2A52` (Deep Celestial Border) | Card outlines, dividers |
| `--accent` | `#D9962B` (Warm Solar Amber) | `#E0A030` (Vibrant Solar Gold) | Active states, glows, hero tags |
| `--track` | `#E4E3F0` (Soft Track Slate) | `#2A2750` (Dark Orbit Ring) | Unfilled progress tracks |

### 7.3 Micro-Interactions & Animation Guidelines
- **Task Complete Pop:** 400ms cubic-bezier bezier pop curve with starlight glow ring expansion.
- **Checkmark Draw:** SVG `stroke-dashoffset` path-drawing animation (300ms).
- **Progress Bar Fill:** Smooth 1000ms cubic-bezier transition (`cubic-bezier(0.2, 0.8, 0.2, 1)`).
- **Theme Crossfade:** 400ms transition on root properties.

---

## 8. Platform Deliverables & Deployment Requirements

### 8.1 Web Deliverables
1. **Next.js Production Build:** Optimized bundles with zero lint or build errors (`next build`).
2. **PWA Configuration:** Valid web manifest (`manifest.json`), service worker for offline asset caching, app icons (192px, 512px, maskable), and standalone display mode.
3. **Responsive Breakpoints:**
   - Desktop ($\ge 1024\text{px}$): 2-column hero (Orbital sky left, stats & stages right), multi-column category grid.
   - Tablet ($768\text{px} - 1023\text{px}$): Adaptive hero, 2-column grids.
   - Mobile ($< 768\text{px}$): Single-column stacked layout, touch-friendly tap targets ($\ge 44\text{px}$).
4. **Environment Configuration:** Comprehensive `.env.example` documenting Supabase credentials and URLs.

### 8.2 Android Deliverables
1. **React Native (Expo) Project:** Modern Expo managed workflow configured under `android/` or as a unified monorepo.
2. **Native App Identity:**
   - Package Name: `com.orbit.tracker`
   - Custom App Icon, Splash Screen with cosmic motif, and themed Android status bar.
3. **Production Builds:**
   - Standalone **APK** for direct device sideloading and testing.
   - **Android App Bundle (AAB)** with release signing setup for Google Play Store upload.
4. **Testing Instructions:** Explicit documentation for Android emulator, Expo Go, and APK device installation.

---

## 9. Quality Assurance & Test Verification Matrix

| # | Test Scenario | Acceptance Criteria |
| :- | :--- | :--- |
| **TC-01** | Category CRUD | User can create, rename, recolor, and delete categories. Destructive dialog warns on non-empty categories. |
| **TC-02** | Subcategory CRUD | Add, rename, and delete subcategories within parent category view. |
| **TC-03** | Task CRUD & Toggle | Adding task immediately updates list; toggling completion fires pop animation and updates statistics immediately. |
| **TC-04** | Hierarchy Mathematics | Total, completed, pending, and percentage metrics match mathematically at subcategory, category, and global levels. |
| **TC-05** | Dynamic Orbit Rendering | Adding/removing tasks or categories recalculates SVG orbit radii and distributes star coordinates accurately. |
| **TC-06** | Stage Transitions | Progressing from 0% through 100% advances stages through Unlit, Spark, Ember, Glow, Radiance, and Zenith. |
| **TC-07** | Auth & Session | Registration, login, logout, and token refresh function without session leaks; protected routes redirect correctly. |
| **TC-08** | Cloud Synchronization | Changes made on Web reflect on Android (and vice-versa) in real-time or upon sync trigger. |
| **TC-09** | Offline Resilience | Tasks toggled in airplane mode persist locally in IndexedDB/SQLite and sync cleanly upon reconnect without data loss. |
| **TC-10** | JSON Export & Import | Export outputs valid formatted JSON. Import accurately reconstructs full state with validation safety against bad payloads. |
| **TC-11** | Theme Switching | Light and dark themes switch cleanly without flash of unstyled content (FOUC); preference persists across reloads. |
| **TC-12** | Responsive Layouts | No horizontal overflow on mobile viewports; touch targets meet WCAG standards. |
| **TC-13** | Android Build Output | Successful generation of release APK and AAB with valid Android signature configuration. |
| **TC-14** | Production Web Build | Clean production build with zero TypeScript warnings or console errors. |

---

## 10. Phased Implementation Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ORBIT ROADMAP                                   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Phase 1      │ Reference Analysis, Architecture & Project Structure         │
│ Phase 2      │ Design System, Reusable UI Components & Orbital Engine       │
│ Phase 3      │ Local State, Full Hierarchical CRUD & Progress Calculations  │
│ Phase 4      │ Supabase Auth, Backend Integration, Sync Engine & Backup     │
│ Phase 5      │ Android React Native / Expo Application & Native UX          │
│ Phase 6      │ Comprehensive Quality Assurance & End-to-End Testing         │
│ Phase 7      │ Production Builds, Web Deployment & Android APK/AAB Package  │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

### Phase 1: Reference Analysis, Architecture & Project Structure
- Inspect and deconstruct reference HTML algorithms (`orbit()`, `cStat()`, `sStat()`, animation tick).
- Structure project repositories: Web Next.js app, shared types/engine package, and Android Expo project.
- Configure TypeScript strict mode, Tailwind CSS v4, and design tokens.

### Phase 2: Design System, Reusable UI Components & Orbital Engine
- Implement typography (`Fraunces` & `Manrope`), theme provider, and color tokens.
- Recreate the SVG orbital visualization with reactive React hooks and smooth CSS/SVG transitions.
- Build header, stats cards, stage progress indicators, category cards, and task rows.

### Phase 3: Core Application Logic & Hierarchical CRUD
- Implement reactive Zustand / Context store for categories, subcategories, and tasks.
- Implement full CRUD operations with cascade confirmation modals.
- Real-time recalculation of all statistics, stage indicators, and orbit positions.
- JSON data export and schema-validated import utility.

### Phase 4: Supabase Backend Integration & Offline Engine
- Deploy Supabase database migrations and configure RLS policies.
- Wire Supabase Auth (Sign up, login, forgot password, session manager).
- Build local-first synchronization engine with mutation queue and offline fallback.

### Phase 5: Android (React Native / Expo) Application
- Scaffold Expo project sharing core business logic, types, and mathematical models.
- Implement native mobile orbital canvas, navigation, gestures, and haptic feedback.
- Configure Android app icons, splash screens, and native permission settings.

### Phase 6: Testing & Quality Assurance
- Execute all 14 test scenarios in the Test Verification Matrix.
- Validate cross-browser performance (Chrome, Firefox, Safari, Mobile Chrome).
- Verify edge cases: 0 categories, 50+ tasks per category, rapid toggle clicks, network loss during sync.

### Phase 7: Production Deployment & Release Packaging
- Generate optimized web production build and deployment configuration.
- Execute EAS / Expo Android builds to produce standalone APK and signed AAB.
- Provide comprehensive deployment documentation and user setup guides.
