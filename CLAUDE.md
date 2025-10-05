# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual Library Trainer is a React web application that helps artists build visual memory and drawing skills. The app presents random subjects for users to draw from memory, then provides reference materials for study and improvement.

**Version 2.0 Evolution:** Transforming from a practice tool into a personalized visual learning ecosystem with user accounts, cloud sync, and premium personal reference collections that grow with each practice session.

## Technology Stack

### Frontend
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router 7.9.3
- **Styling**: Tailwind CSS 3.4.17
- **Icons**: Lucide React
- **Package Manager**: npm

### Backend (v2.0)
- **Database & Auth**: Supabase (PostgreSQL + Authentication + Storage)
- **ORM**: Drizzle ORM 0.44.5 with Drizzle Kit 0.31.5
- **Payments**: Stripe
- **Hosting**: Vercel (frontend) + Supabase (backend)

## Development Commands

```bash
npm run dev        # Start development server (Vite dev server)
npm run build      # TypeScript compile + Vite build
npm run lint       # Run ESLint code linting
npm run typecheck  # Run TypeScript type checking
npm run preview    # Preview production build locally

# Database Management (Drizzle)
npm run db:generate # Generate database migrations from schema
npm run db:migrate  # Apply pending migrations
npm run db:push     # Push schema changes to database
npm run db:studio   # Open Drizzle Studio (database GUI)
```

Note: No testing framework is currently configured.

## Architecture

The application is structured as a page-based React app with React Router navigation:

- **Entry Point**: `src/main.tsx`
- **Main Component**: `src/App.tsx` - Routing orchestrator with React Router
- **Pages**: Page components in `src/pages/` (Landing, Dashboard, Practice, etc.)
- **Components**: Reusable UI components in `src/components/`
- **Services**: Business logic layer in `src/services/`
- **Contexts**: React Context for auth and modals in `src/contexts/`
- **Database**: Dual approach with Supabase client and Drizzle ORM in `src/lib/`
- **State Management**: React useState/useContext (no external state management)
- **Styling**: Combination of Tailwind utility classes and minimal custom CSS

### Application Flow
1. **Page-Based Navigation**: `/` → `/app/dashboard` → `/app/practice/:subject` → references
2. **Route Structure**:
   - `/` - Landing page
   - `/app/dashboard` - Main dashboard with lists and progress
   - `/app/practice/:subject` - Drawing session page
   - `/app/list/:listId` - List exploration page
   - `/app/create-list` - Custom list creation
3. **Features**: Algorithm mode for adaptive learning, timer functionality, rating system, and Pinterest-style image collections

### File Structure
```
src/
├── components/     # Reusable UI components (21 components)
├── pages/         # Page components (Landing, Dashboard, Practice, etc.)
├── contexts/      # React Context providers (Auth, Modal)
├── services/      # Business logic layer (5 service modules)
├── lib/           # External service clients (Supabase, Drizzle, Stripe)
├── hooks/         # Custom React hooks (localStorage persistence)
├── data/          # Training lists and community data
├── types/         # TypeScript type definitions
├── utils/         # Helper functions (time, references, styling)
├── App.tsx        # React Router setup and route definitions
└── main.tsx       # Application entry point
```

## Data Persistence

The application uses localStorage to persist user data across browser sessions:

- **Practice History** (`vlt-history`) - All completed practice sessions with ratings and times
- **Item Ratings** (`vlt-ratings`) - User performance ratings for each drawing subject
- **Custom Lists** (`vlt-custom-lists`) - User-created training lists with categories
- **App Settings** (`vlt-settings`) - Algorithm mode preference and active list selection

Data persists automatically and restores on page refresh or browser restart.

## Custom List Creation

Users can create custom training lists with:

- **Flexible Format** - Simple list (one item per line) or categorized format
- **Category Support** - Automatic parsing of "Category:" headers
- **Form Validation** - Ensures required fields and valid content
- **Instant Switching** - Newly created lists become active immediately
- **Local Storage** - Custom lists persist across sessions

## Configuration Files

- `vite.config.js` - Vite configuration with React plugin
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS setup
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer

## Version 2.0 Product Strategy

### Monetization Model

**Freemium SaaS with Clear Value Ladder:**

#### Free Tier: "Visual Library Trainer"
- Core training experience (drawing phases, timer, basic stats)
- Search button links to external sites
- localStorage-only data
- 3 saved images per drawing subject (taste of premium)

#### Premium Tier: "Visual Library Pro" - $9/monthly, $79/yearly
- **Unlimited personal image collections**
- **Cloud sync across devices**
- **Advanced analytics** (progress tracking, weak subject identification)
- **Custom list creation** (unlimited)
- **Export collections** (PDF mood boards, Pinterest boards)
- **Priority support**

#### Future Roadmap: "Visual Library Studio" - $19/monthly, $179/yearly
- Everything in Pro
- **AI-powered reference suggestions** based on your style
- **Collaborative collections** (share with art communities)
- **Advanced organization** (tags, categories, notes)
- **Integration APIs** (Figma, Adobe, Procreate)

### Authentication Strategy

**Seamless Progressive Enhancement:**
1. **Anonymous Start:** Users begin immediately, no friction
2. **Value-First Signup:** After 2-3 sessions, gentle prompt to "save your progress"
3. **Social Login Priority:** Google/Apple/Discord for artist communities
4. **Email Fallback:** Simple email/password option

### Image Collection UX

**Enhanced Reference Phase:**
- Personal image collections display as Pinterest-style grid
- Simple URL input for adding images from any source
- Auto-arrange by aspect ratio for optimal display
- Drag-and-drop reordering with context menu actions

### Technical Architecture

#### Database Architecture

**Dual Database Approach:**
- **Supabase**: Primary database with authentication and real-time features
- **Drizzle ORM**: Type-safe database operations and migrations

**Schema** (managed via `src/lib/schema.ts`):
```sql
users (id, email, subscription_tier, created_at)
subject_boards (id, user_id, drawing_subject, created_at, updated_at)
board_images (id, board_id, image_url, notes, position, created_at)
practice_sessions (id, user_id, subject, duration, rating, images_used, created_at)
custom_lists (id, user_id, name, items, is_active, created_at)
```

**Configuration:**
- `drizzle.config.ts` - Drizzle Kit configuration
- `src/lib/db.ts` - Drizzle database client
- `src/lib/supabase.ts` - Supabase client
- Environment variable: `DATABASE_URL`

#### Implementation Phases
1. **Phase 1:** Auth + basic image saving + payments (current implementation)
2. **Phase 2:** Advanced image management + analytics
3. **Phase 3:** AI features + collaboration (Studio tier)

### Environment Variables Required

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (for Drizzle)
DATABASE_URL=postgresql://user:password@host:port/database

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Implementation Status ✅

### ✅ **Completed Features**

#### Authentication System
- **Components**: `AuthContext`, `AuthModal`, `Header` integration
- **Features**: Google OAuth, email/password, progressive signup
- **Files**: `src/contexts/AuthContext.tsx`, `src/components/AuthModal.tsx`

#### **🎨 Pinterest-Style Board System** (MAJOR v2.1 Feature)
- **Components**: `PersonalImageBoard`, `ImageUrlInput`, enhanced `ReferencePhase`
- **Features**: Contextual board creation, Pinterest masonry layout, integrated curation
- **Files**: `src/components/PersonalImageBoard.tsx`, `src/components/ImageUrlInput.tsx`
- **Service**: `src/services/boardService.ts` (NEW - Pinterest architecture)
- **Database**: `subject_boards`, `board_images` tables with full RLS security
- **UX**: Automatic board per drawing subject, hover interactions, seamless saving

#### Payment Integration
- **Components**: `UpgradeModal` with Stripe checkout
- **Features**: Freemium tiers, upgrade prompts, pricing strategy
- **Files**: `src/components/UpgradeModal.tsx`, `src/lib/stripe.ts`

#### Data Migration
- **Components**: `MigrationPrompt` for localStorage → cloud migration
- **Features**: Automatic detection, progress tracking, validation
- **Files**: `src/components/MigrationPrompt.tsx`, `src/services/dataMigration.ts`

#### Database Schema
- **Tables**: users, subject_boards, board_images, practice_sessions, custom_lists
- **Types**: Complete TypeScript definitions in `src/types/index.ts`
- **Service**: Database client in `src/lib/supabase.ts`
- **Migration**: `reference-boards-migration.sql`, `board-migration-fixes.sql`

### 🚀 **Production Ready - Launch Version**
- All TypeScript errors resolved ✅
- ESLint passes ✅
- Build successful ✅
- Components exported ✅
- Environment configured ✅
- **Complete user flow working** (Landing → Practice → Rating) ✅
- **Authentication system stable** (progressive signup, OAuth) ✅
- **Payment integration ready** (Stripe commented out for launch) ✅
- **Admin dashboard functional** (key-based access with metrics) ✅
- **Legal pages complete** (Terms, Privacy Policy) ✅
- **Contact system working** (mailto-based with feature requests) ✅
- **Error handling comprehensive** (graceful fallbacks throughout) ✅
- **Responsive design complete** (mobile & desktop) ✅

## Key Architectural Patterns

### **Three-Layer Data Persistence Strategy**
The app uses a sophisticated persistence model:

1. **React State** - Component-level state (useState/useContext)
2. **localStorage** - Client-side persistence with `useLocalStorage` hook
3. **Supabase Cloud** - Authentication and premium features (v2.0 ready)

**Critical localStorage Keys:**
- `vlt-history` - Practice sessions with ratings/timing for algorithm
- `vlt-ratings` - Item difficulty ratings for spaced repetition
- `vlt-custom-lists` - User-created lists with category parsing
- `vlt-settings` - Algorithm mode, active list, preferences

### **Phase-Based Practice System**
Each practice session follows a structured flow:

1. **Drawing Phase** - Memory-only drawing with optional timer
2. **Reference Phase** - Study curated references, build personal collection
3. **Rating Phase** - Self-assessment for algorithm improvement
4. **Algorithm Selection** - Multiple modes (struggling-focus, balanced, recent-focus)

### **Modal & Toast System Architecture**
Centralized UI state management:
- `ModalContext` - Auth modal, upgrade modal, toast notifications
- `AuthContext` - User state, subscription tiers, authentication flow
- Progressive enhancement pattern (anonymous → value demonstration → signup)

### **Admin Dashboard Architecture**
Key-based access system (`afterimage2025`) with comprehensive analytics:
- User metrics (total, pro conversion, session duration)
- Content metrics (custom lists created, total subjects)
- Growth tracking (daily activity, popular subjects)
- Mock data fallback for demo purposes

### **Service Layer Patterns**
Business logic organized by domain:
- `progressTracking.ts` - Analytics, streaks, performance metrics
- `dataMigration.ts` - localStorage to cloud migration patterns
- `imageCollections.ts` - Pinterest-style board management
- Error handling with timeouts, retries, graceful degradation

### **Component Architecture Patterns**
- **Page-based routing** (not component phases) for better SEO
- **Shared Layout** pattern with Header, Toast, Modal providers
- **Hook composition** for localStorage persistence and auth state
- **Progressive enhancement** for anonymous users

## Development Workflow

### **Common Development Tasks**
```bash
# Start development with hot reload
npm run dev

# Type checking and linting
npm run typecheck && npm run lint

# Production build
npm run build && npm run preview

# Database operations (when Supabase configured)
npm run db:generate  # After schema changes
npm run db:push      # Push to development
npm run db:studio    # Visual database browser
```

### **Key File Locations**
- **Route definitions**: `src/App.tsx` (React Router setup)
- **Authentication logic**: `src/contexts/AuthContext.tsx`
- **Practice algorithm**: `src/components/Dashboard.tsx` (generateChallenge)
- **Timer system**: `src/pages/PracticePage.tsx` (dual timer logic)
- **Admin dashboard**: `src/pages/AdminDashboard.tsx` (key: `afterimage2025`)
- **Database schema**: `src/lib/schema.ts` (Drizzle definitions)

### **Environment Setup**
The app works in multiple modes:
- **localStorage-only** (no env vars needed)
- **Supabase integration** (requires VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- **Payment processing** (requires VITE_STRIPE_PUBLISHABLE_KEY)

## Launch Status & Next Steps

### **Ready for Launch**
This is a production-ready SaaS application with:
- Complete user onboarding flow
- Stable practice system with algorithm-based selection
- Admin analytics dashboard
- Legal compliance (Terms, Privacy)
- Responsive design across devices
- Error boundaries and graceful fallbacks

### **Post-Launch Priorities**
1. **Real Supabase Analytics** - Remove mock data from admin dashboard
2. **Payment Activation** - Uncomment Stripe integration
3. **Curated Starter Images** - Add reference images for popular subjects
4. **Performance Monitoring** - Add error tracking and user analytics