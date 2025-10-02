# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual Library Trainer is a React web application that helps artists build visual memory and drawing skills. The app presents random subjects for users to draw from memory, then provides reference materials for study and improvement.

**Version 2.0 Evolution:** Transforming from a practice tool into a personalized visual learning ecosystem with user accounts, cloud sync, and premium personal reference collections that grow with each practice session.

## Technology Stack

### Frontend
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.13
- **Icons**: Lucide React
- **Package Manager**: npm

### Backend (v2.0)
- **Database & Auth**: Supabase (PostgreSQL + Authentication + Storage)
- **Payments**: Stripe
- **Hosting**: Vercel (frontend) + Supabase (backend)

## Development Commands

```bash
npm run dev        # Start development server (Vite dev server)
npm run build      # TypeScript compile + Vite build
npm run lint       # Run ESLint code linting
npm run typecheck  # Run TypeScript type checking
npm run preview    # Preview production build locally
```

Note: No testing framework is currently configured.

## Architecture

The application is structured as a modular single-page React app with phase-based navigation:

- **Entry Point**: `src/main.tsx`
- **Main Component**: `src/App.tsx` - Main application orchestrator
- **Components**: Individual phase components in `src/components/`
- **Data**: Structured data files in `src/data/`
- **Types**: TypeScript interfaces in `src/types/`
- **Utils**: Helper functions in `src/utils/`
- **State Management**: React useState hooks (no external state management)
- **Styling**: Combination of Tailwind utility classes and minimal custom CSS

### Application Flow
1. Welcome phase → Dashboard → Drawing phase → Reference phase → Complete phase
2. Features include algorithm mode for adaptive learning, timer functionality, and rating system
3. Data structure supports modular list management (Ultimate Visual Library with 100+ drawing subjects)

### File Structure
```
src/
├── components/     # React components (Welcome, Dashboard, etc.)
├── data/          # Training lists and community data
├── hooks/         # Custom React hooks (localStorage persistence)
├── types/         # TypeScript type definitions
├── utils/         # Helper functions (time, references, styling)
├── App.tsx        # Main application component
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

#### Database Schema
```sql
users (id, email, subscription_tier, created_at)
image_collections (id, user_id, drawing_subject, image_url, position, notes, created_at)
practice_sessions (id, user_id, subject, duration, rating, images_used, created_at)
custom_lists (id, user_id, name, items, is_active, created_at)
```

#### Implementation Phases
1. **Phase 1:** Auth + basic image saving + payments (current implementation)
2. **Phase 2:** Advanced image management + analytics
3. **Phase 3:** AI features + collaboration (Studio tier)

### Environment Variables Required

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

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

### 🚀 **Production Ready - v2.1**
- All TypeScript errors resolved ✅
- ESLint passes ✅
- Build successful ✅
- Components exported ✅
- Environment configured ✅
- **Pinterest board system fully functional** ✅
- **Critical bugs fixed (infinite loading, persistence)** ✅
- **Database migration applied successfully** ✅