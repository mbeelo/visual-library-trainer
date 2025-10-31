# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual Library Trainer is a React web application that helps artists build visual memory and drawing skills. The app presents random subjects for users to draw from memory, then provides reference materials for study and improvement.

**Version 2.0 Evolution:** Transforming from a practice tool into a personalized visual learning ecosystem with user accounts, cloud sync, and premium personal reference collections that grow with each practice session.

## Technology Stack

### Frontend
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router 7.9.3 with automatic scroll restoration
- **Styling**: Tailwind CSS 3.4.17
- **Icons**: Lucide React
- **Charts**: Recharts 3.2.1 (for admin analytics)
- **Package Manager**: npm

### Backend & Deployment
- **Database & Auth**: Supabase (PostgreSQL + Authentication + Storage)
- **Payments**: Stripe (LIVE - integrated and production-ready)
- **Tax Compliance**: Stripe Tax with California registration (approved)
- **Hosting**: Vercel with automatic deployments from GitHub
- **Domain**: `afterimage.app` (live production domain)
- **Environment**: Production-ready with security headers and OG meta tags

## Development Commands

```bash
npm run dev        # Start development server (Vite dev server on port 5174)
npm run build      # TypeScript compile + Vite build (for production)
npm run lint       # Run ESLint code linting
npm run typecheck  # Run TypeScript type checking
npm run preview    # Preview production build locally

# Deployment (Automatic via GitHub)
git add -A && git commit -m "message" && git push origin main
# This triggers automatic Vercel deployment to afterimage.app

# Database Management (Supabase + Drizzle - currently disabled)
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
├── components/     # Reusable UI components (23+ components)
│   ├── ScrollToTop.tsx         # Automatic scroll restoration on navigation
│   ├── PersonalImageBoard.tsx  # Pinterest-style image collections
│   ├── UpgradeModal.tsx        # Stripe payment integration (LIVE)
│   ├── ErrorBoundary.tsx       # Application error handling
│   └── ...
├── pages/          # Page components (11 pages)
│   ├── Landing.tsx            # Marketing homepage
│   ├── AdminDashboard.tsx     # Analytics dashboard (key: after_image_2025)
│   ├── AccountPage.tsx        # User settings and subscription
│   └── ...
├── contexts/       # React Context providers (Auth state management)
├── services/       # Business logic layer (5 service modules)
│   ├── simpleImageService.ts  # Image collection management
│   ├── progressTracking.ts   # Analytics and performance metrics
│   └── ...
├── lib/           # External service clients (Supabase, Stripe)
├── hooks/         # Custom React hooks (localStorage persistence)
├── data/          # Training lists and community data
├── types/         # TypeScript type definitions
├── utils/         # Helper functions (time, references, styling)
├── App.tsx        # React Router setup with ScrollToTop
└── main.tsx       # Application entry point
api/               # Vercel serverless functions
└── create-checkout-session.ts # Stripe Checkout API endpoint
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

**Simplified Supabase Approach (2024 Best Practices):**
- **Primary**: Supabase client with minimal configuration for optimal performance
- **Deprecated**: Drizzle ORM (files disabled: `src/lib/db.ts.disabled`, `src/lib/schema.ts.disabled`)

**Current Schema** (directly managed in Supabase):
```sql
users (id, email, subscription_tier, created_at)
image_collections (id, user_id, drawing_subject, image_url, position, notes, created_at)
practice_sessions (id, user_id, subject, duration, rating, images_used, created_at)
custom_lists (id, user_id, name, items, is_active, created_at)
```

**Critical Configuration:**
- `src/lib/supabase.ts` - Minimal 2024 Supabase client (essential for performance)
- `src/vite-env.d.ts` - TypeScript environment variable definitions (required for Vite)
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**⚠️ Authentication & RLS Requirements:**
- **Row Level Security (RLS)** is ACTIVE on all tables - this is critical for security
- **INSERT operations REQUIRE authenticated users** - unauthenticated attempts will hang/fail
- **Always check user authentication** before database operations in components
- **Performance**: With proper auth, operations complete in ~250-300ms

#### Implementation Phases
1. **Phase 1:** Auth + basic image saving + payments (current implementation)
2. **Phase 2:** Advanced image management + analytics
3. **Phase 3:** AI features + collaboration (Studio tier)

### Environment Variables

**Production (Vercel):**
```bash
# Supabase (currently configured and working)
VITE_SUPABASE_URL=https://bcdmydwsoxpzhntyiuxf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Vicu7_LtKedwD-5mJE9sXA_aTwZdk1G

# Stripe (LIVE PAYMENTS - configured and working)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51SH5i0920FItfO5V2vyayHHzFPFci3dkbazxRiExbIZxRFwZSNQdN5TbaDYrKxHE6enkQTmLWsXzEHT44FicByAh00k2cqkIgn
STRIPE_SECRET_KEY=sk_live_*** # Server-side only, configured in Vercel
VITE_STRIPE_PRICE_ID_MONTHLY=price_1SHRM0920FItfO5VqeL6x6qP
VITE_STRIPE_PRICE_ID_YEARLY=price_1SHRM3920FItfO5VYpyguuak

# Admin Access
VITE_ADMIN_KEY=after_image_2025
```

**Local Development:**
- Copy `.env.example` to `.env`
- App works without environment variables (localStorage-only mode)
- Add Supabase vars for cloud features

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

#### **💳 Live Payment Integration** (PRODUCTION READY)
- **Components**: `UpgradeModal` with live Stripe checkout
- **Features**: Monthly ($9) & Yearly ($79) subscriptions, tax compliance, upgrade prompts
- **Files**: `src/components/UpgradeModal.tsx`, `src/lib/stripe.ts`, `api/create-checkout-session.ts`
- **Tax Compliance**: California seller's permit approved, Stripe Tax auto-configured
- **Status**: LIVE PAYMENTS READY - can process real subscriptions immediately

#### Data Migration
- **Components**: `MigrationPrompt` for localStorage → cloud migration
- **Features**: Automatic detection, progress tracking, validation
- **Files**: `src/components/MigrationPrompt.tsx`, `src/services/dataMigration.ts`

#### Database Schema
- **Tables**: users, subject_boards, board_images, practice_sessions, custom_lists
- **Types**: Complete TypeScript definitions in `src/types/index.ts`
- **Service**: Database client in `src/lib/supabase.ts`
- **Migration**: `reference-boards-migration.sql`, `board-migration-fixes.sql`

### 🚀 **LIVE PRODUCTION SaaS - READY FOR REVENUE**
- All TypeScript errors resolved ✅
- ESLint passes ✅
- Build successful ✅
- Components exported ✅
- Environment configured ✅
- **Complete user flow working** (Landing → Practice → Rating) ✅
- **Authentication system stable** (progressive signup, OAuth) ✅
- **LIVE PAYMENTS ACTIVE** (Stripe + California tax compliance) ✅
- **Tax compliance approved** (CA seller's permit + Stripe Tax) ✅
- **Admin dashboard functional** (key-based access with metrics) ✅
- **Legal pages complete** (Terms, Privacy Policy) ✅
- **Contact system working** (mailto-based with feature requests) ✅
- **Error handling comprehensive** (graceful fallbacks throughout) ✅
- **Responsive design complete** (mobile & desktop) ✅
- **MONETIZATION READY** - Can process real subscriptions and generate revenue ✅

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
Key-based access system (`after_image_2025`) with comprehensive analytics:
- User metrics (total users, pro conversion, session duration)
- Content metrics (custom lists created, total subjects)
- Growth tracking (daily activity, popular subjects)
- Recharts integration for data visualization
- Mock data fallback for demo purposes
- Accessible at `/admin` with secure key authentication

### **Service Layer Patterns**
Business logic organized by domain:
- `simpleImageService.ts` - **Primary image service** with authentication-aware operations
- `progressTracking.ts` - Analytics, streaks, performance metrics
- `dataMigration.ts` - localStorage to cloud migration patterns
- `imageCollections.ts` - Legacy Pinterest-style board management (deprecated)
- Error handling with timeouts, retries, graceful degradation, localStorage fallbacks

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
- **Route definitions**: `src/App.tsx` (React Router setup with ScrollToTop)
- **Authentication logic**: `src/contexts/AuthContext.tsx` (with progressive signup)
- **Practice algorithm**: `src/components/Dashboard.tsx` (generateChallenge)
- **Timer system**: `src/pages/PracticePage.tsx` (dual timer logic)
- **Admin dashboard**: `src/pages/AdminDashboard.tsx` (key: `after_image_2025`)
- **Image collections**: `src/services/simpleImageService.ts` (Authentication-aware image management)
- **Landing page**: `src/pages/Landing.tsx` (marketing homepage)
- **Social media**: `index.html` (OG meta tags, afterimage.app domain)

### **Environment Setup**
The app works in multiple modes:
- **localStorage-only** (no env vars needed)
- **Supabase integration** (requires VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- **Payment processing** (requires VITE_STRIPE_PUBLISHABLE_KEY)

## Security & Production Readiness

### **Security Audit Completed ✅**
- ✅ **Hardcoded secrets removed** from source code
- ✅ **Environment variables secured** (Supabase credentials externalized)
- ✅ **Git history cleaned** of sensitive data
- ✅ **Admin key protected** via environment variables
- ✅ **Security headers configured** in Vercel deployment
- ✅ **HTTPS enforced** with proper OG meta tags

### **Production Deployment ✅**
- ✅ **GitHub repository**: https://github.com/mbeelo/visual-library-trainer
- ✅ **Live domain**: https://afterimage.app (with automatic deployments)
- ✅ **Vercel integration**: Auto-deploy on git push to main
- ✅ **Environment variables**: Configured in Vercel production
- ✅ **Social media previews**: OG image and meta tags working

### **User Experience Polished ✅**
- ✅ **AI-generated copy removed** from marketing pages
- ✅ **Scroll position fixed** (ScrollToTop component)
- ✅ **Link previews working** with branded OG image
- ✅ **Professional domain** (afterimage.app not Vercel subdomain)

## Launch Status & Next Steps

### **Ready for Launch**
This is a production-ready SaaS application with:
- ✅ **Complete security audit** passed with all vulnerabilities fixed
- ✅ **Professional domain** with automatic deployments
- ✅ **Stable user onboarding** flow with progressive authentication
- ✅ **Admin analytics dashboard** with key-based authentication
- ✅ **Legal compliance** (Terms, Privacy Policy, Contact)
- ✅ **Responsive design** across all devices
- ✅ **Error boundaries** and graceful fallbacks throughout
- ✅ **Social media ready** with branded link previews

### **Post-Launch Priorities**
1. **Analytics Integration** - Connect real Supabase analytics to admin dashboard
2. **Payment Activation** - Enable Stripe integration when ready for subscriptions
3. **Content Curation** - Add starter reference images for popular subjects
4. **Performance Monitoring** - Add error tracking and user behavior analytics

## Future Feature: Google Docs-Style Library Sharing

### **Concept Overview**
Transform AfterImage into a collaborative ecosystem by allowing users to share their curated training lists and reference collections with Google Docs-style sharing permissions.

### **Core Sharing Model**
**"Anyone with the link can view"** - Similar to Google Docs sharing:
- **Share by URL**: Generate shareable links for any training list + reference collection
- **Read-only access**: Shared users can practice with the list but cannot modify it
- **Import option**: Viewers can copy/import shared collections to their own account
- **Privacy control**: List owners can make collections public, private, or link-shareable

### **User Experience Flow**

#### For List Creators:
1. **Build Collection**: Create custom list + curate reference images during practice
2. **Share Button**: Click "Share this Collection" in list settings
3. **Copy Link**: Get shareable URL like `afterimage.app/shared/abc123`
4. **Analytics**: See view count, import count, popular subjects from their shared collection

#### For List Viewers:
1. **Access via Link**: Visit shared URL (no account required for viewing)
2. **Preview Mode**: See list overview, sample references, creator info
3. **Practice Session**: Full drawing/reference experience with shared collection
4. **Import Option**: "Add to My Lists" button (requires account)

### **Database Schema Extensions**

```sql
-- Shared Collections Table
shared_collections (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  source_list_id UUID REFERENCES custom_lists(id),
  share_token VARCHAR(50) UNIQUE, -- For URL: /shared/{token}
  title VARCHAR(255),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  import_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Shared Collection Images (Snapshot of references)
shared_collection_images (
  id UUID PRIMARY KEY,
  collection_id UUID REFERENCES shared_collections(id),
  subject VARCHAR(255),
  image_url TEXT,
  position INTEGER,
  notes TEXT,
  created_at TIMESTAMP
);

-- Collection Imports (Track who imported what)
collection_imports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  shared_collection_id UUID REFERENCES shared_collections(id),
  imported_at TIMESTAMP
);
```

### **Monetization Opportunities**

#### Free Tier Limitations:
- Can share 1 collection maximum
- Shared collections limited to 20 subjects
- Basic analytics (view count only)

#### Pro Tier Benefits:
- Unlimited shared collections
- Detailed analytics (geographic data, engagement metrics)
- Custom collection branding
- Priority in discovery features

#### Studio Tier (Future):
- Collaborative editing (multiple contributors)
- Advanced organization (tags, categories)
- Integration with art platforms (Instagram, ArtStation)

### **Technical Implementation**

#### Phase 1: Basic Sharing (MVP)
```typescript
// Share Collection Service
export class CollectionSharingService {
  static async createSharedCollection(listId: string, userId: string) {
    const shareToken = generateRandomToken(12)
    const snapshot = await this.createCollectionSnapshot(listId)

    return supabase.from('shared_collections').insert({
      creator_id: userId,
      source_list_id: listId,
      share_token: shareToken,
      title: snapshot.title,
      description: snapshot.description
    })
  }

  static async getSharedCollection(token: string) {
    return supabase
      .from('shared_collections')
      .select('*, shared_collection_images(*)')
      .eq('share_token', token)
      .single()
  }
}
```

#### Phase 2: Discovery & Analytics
- Public collection gallery
- Search and filtering
- Creator profiles
- Engagement metrics

#### Phase 3: Advanced Features
- Collection versioning
- Collaborative curation
- AI-powered recommendations

### **Competitive Advantages**

1. **Pinterest for Artists**: Visual-first sharing with practice integration
2. **GitHub for Art Training**: Version control for learning resources
3. **Community Building**: Transform individual practice into collaborative learning
4. **Organic Growth**: Viral sharing mechanics built into core product

### **Success Metrics**
- **Engagement**: % of users who share collections
- **Viral Coefficient**: Average imports per shared collection
- **Retention**: Shared collection users vs. regular users
- **Monetization**: Pro conversion rate for sharing features

### **Implementation Priority**
- **Post-Launch Feature**: Implement after core product stability
- **Community-Driven**: Launch when user base requests collaboration
- **Technical Foundation**: Current database schema supports future expansion

## Critical Debugging Insights

### **Supabase Performance & Authentication Issues**

**Common Issue**: INSERT operations hanging indefinitely
**Root Cause**: Unauthenticated users triggering Row Level Security (RLS) violations
**Solution**: Always check `user` authentication before database operations

**Debugging Pattern:**
```typescript
// ❌ BAD - Will hang if user is not authenticated
await SimpleImageService.addImage(subject, imageInput, user.id)

// ✅ GOOD - Check authentication first
if (!user) {
  setError('Please sign in to save images to your collection')
  onSignInNeeded?.()
  return
}
if (!user.id) {
  setError('Authentication error: Invalid user ID')
  return
}
await SimpleImageService.addImage(subject, imageInput, user.id)
```

**Browser Compatibility Notes:**
- **Chrome**: Extensions may interfere with Supabase requests (ad blockers, privacy tools)
- **Safari**: Cleaner environment, better for testing Supabase performance
- **Performance**: With proper auth, expect 250-300ms response times

**Key Files for Authentication:**
- `src/components/ImageUrlInput.tsx` - Has proper auth checks implemented
- `src/contexts/AuthContext.tsx` - Provides user state and authentication methods
- `src/lib/supabase.ts` - Minimal client configuration (critical for performance)

### **Authentication Flow Patterns**

**Progressive Enhancement Strategy:**
1. **Anonymous Usage**: Users can practice immediately without signing up
2. **Value Demonstration**: Core features work with localStorage persistence
3. **Upgrade Prompts**: When attempting cloud features (saving images), prompt for sign-in
4. **Seamless Transition**: Data migration from localStorage to cloud after authentication

**Component Authentication Pattern:**
```typescript
const { user } = useAuth()

// Always check authentication before cloud operations
if (!user) {
  // Fallback to localStorage or prompt for sign-in
  setError('Please sign in to save images to your collection')
  if (onSignInNeeded) onSignInNeeded()
  return
}
```

**Service Layer Authentication:**
- All services that interact with Supabase require `userId` parameter
- Services include localStorage fallbacks for offline/unauthenticated scenarios
- Performance optimizations include caching and timeout handling

## Google Analytics Strategy - User Intelligence Goldmine

### **UTM Parameter Framework**
AfterImage uses comprehensive UTM tracking across all external links:

**UTM Structure:**
- `utm_source=afterimage` (consistent brand attribution)
- `utm_medium=referral` (traffic type)
- `utm_campaign=[feature]` (feature-specific tracking)
- `utm_content=[platform]` (granular platform tracking)

**Implemented UTM Campaigns:**
1. **Reference Search** (`utm_campaign=reference_search`)
   - Pinterest: `utm_content=pinterest`
   - ArtStation: `utm_content=artstation`
   - Google Images: `utm_content=google`
   - Unsplash: `utm_content=unsplash`
   - Pexels: `utm_content=pexels`
   - Pixabay: `utm_content=pixabay`

2. **AI Generation** (`utm_campaign=ai_generation`)
   - ChatGPT: `utm_content=create_list`
   - Claude: `utm_content=create_list`
   - DeepSeek: `utm_content=create_list`

### **Google Analytics 4 (GA4) Implementation Plan**

#### **Essential Events to Track:**

**User Journey Events:**
```javascript
// Landing page engagement
gtag('event', 'engagement_time_msec', {
  value: timeOnPage,
  custom_parameter: 'landing_page'
});

// Trial start (first practice session)
gtag('event', 'trial_start', {
  currency: 'USD',
  value: 9.00, // potential monthly value
  item_category: 'drawing_practice'
});

// Practice session completion
gtag('event', 'level_end', {
  level_name: drawingSubject,
  character_class: category,
  success: rating === 'easy' || rating === 'got-it'
});

// Drawing performance rating
gtag('event', 'post_score', {
  score: ratingToScore(rating), // easy=4, good=3, okay=2, needs_work=1
  level_name: drawingSubject,
  character_class: category
});

// Reference image saved
gtag('event', 'add_to_wishlist', {
  currency: 'USD',
  value: 0.10, // micro-value per saved reference
  item_id: drawingSubject,
  item_name: drawingSubject,
  item_category: category,
  quantity: 1
});

// Custom list creation
gtag('event', 'create_group', {
  group_id: listId,
  item_category: 'custom_list',
  value: 1.00 // engagement value
});

// AI generation usage
gtag('event', 'share', {
  method: 'ai_generation',
  content_type: aiPlatform, // 'chatgpt', 'claude', 'deepseek'
  item_id: 'ai_prompt_template'
});

// Subscription conversion
gtag('event', 'purchase', {
  transaction_id: checkoutSessionId,
  value: subscriptionPrice,
  currency: 'USD',
  items: [{
    item_id: 'afterimage_pro',
    item_name: 'AfterImage Pro',
    item_category: 'subscription',
    item_variant: planType, // 'monthly' or 'yearly'
    quantity: 1,
    price: subscriptionPrice
  }]
});

// Feature usage
gtag('event', 'select_content', {
  content_type: 'feature',
  item_id: featureName // 'timer', 'algorithm_mode', 'reference_search'
});
```

**Custom Metrics to Track:**
1. **Drawing Performance Score** - Average rating across sessions
2. **Session Intensity** - Drawings per session
3. **Reference Collection Rate** - Images saved per subject
4. **List Engagement** - Custom lists created per user
5. **Time to Value** - Sessions until first "good" rating
6. **Feature Adoption Rate** - % using timers, algorithms, AI generation

#### **Enhanced Ecommerce Configuration:**

**Funnel Analysis:**
```javascript
// Step 1: Landing page view
gtag('event', 'page_view', {
  page_title: 'AfterImage - Visual Memory Training',
  page_location: window.location.href,
  custom_parameter: 'marketing_funnel_start'
});

// Step 2: First practice session (trial)
gtag('event', 'begin_checkout', {
  currency: 'USD',
  value: 9.00,
  items: [{
    item_id: 'trial_experience',
    item_name: 'Drawing Practice Trial',
    item_category: 'engagement',
    quantity: 1
  }]
});

// Step 3: Reference image limit hit (upgrade trigger)
gtag('event', 'view_promotion', {
  promotion_id: 'image_limit_upgrade',
  promotion_name: 'Unlimited References',
  creative_name: 'upgrade_modal',
  creative_slot: 'post_drawing'
});

// Step 4: Upgrade modal view
gtag('event', 'view_item', {
  currency: 'USD',
  value: subscriptionPrice,
  items: [{
    item_id: 'afterimage_pro',
    item_name: 'AfterImage Pro',
    item_category: 'subscription',
    item_variant: planType
  }]
});

// Step 5: Subscription purchase
gtag('event', 'purchase', { /* as above */ });
```

#### **User Segmentation Strategy:**

**Custom Dimensions:**
1. **User Type**: 'anonymous', 'registered', 'pro_subscriber'
2. **Skill Level**: Based on average drawing ratings
3. **Usage Pattern**: 'casual' (<3 sessions/week), 'regular' (3-7), 'intensive' (7+)
4. **Primary Category**: Most practiced drawing category
5. **Acquisition Source**: 'organic', 'influencer', 'referral', 'direct'
6. **Feature Preference**: 'timer_user', 'algorithm_user', 'ai_user'

**Audience Segments:**
- **High-Intent Artists**: Multiple sessions, good ratings, saves references
- **Strugglers**: Low ratings, high session frequency (need encouragement)
- **List Creators**: Users who create custom lists (content creators)
- **Reference Collectors**: High image-saving rate (visual learners)
- **AI Adopters**: Uses AI generation features (tech-savvy)
- **Conversion Ready**: Anonymous users with 3+ sessions

#### **Attribution & Influencer Tracking:**

**Enhanced UTM Analysis:**
```javascript
// Track influencer attribution
gtag('event', 'campaign_details', {
  campaign_source: getUrlParam('utm_source'), // 'instagram_artist_x'
  campaign_medium: getUrlParam('utm_medium'), // 'influencer_post'
  campaign_name: getUrlParam('utm_campaign'), // 'art_challenge_2024'
  campaign_content: getUrlParam('utm_content'), // 'story_link'
  campaign_term: getUrlParam('utm_term') // 'digital_art'
});

// Cross-platform journey tracking
gtag('event', 'cross_platform_activity', {
  source_platform: referrerPlatform,
  landing_page: currentPage,
  time_to_action: timeToFirstPractice,
  conversion_path: 'influencer_post -> landing -> practice -> signup'
});
```

#### **Conversion Optimization Insights:**

**Key Metrics Dashboard:**
1. **Acquisition Metrics**:
   - Cost per acquisition by source
   - Influencer ROI tracking
   - Organic vs paid conversion rates

2. **Engagement Metrics**:
   - Session depth (practices per visit)
   - Feature adoption rates
   - Time to value metrics

3. **Retention Metrics**:
   - Weekly/monthly active users
   - Session frequency patterns
   - Feature stickiness scores

4. **Revenue Metrics**:
   - Freemium conversion rates
   - Average revenue per user (ARPU)
   - Lifetime value by acquisition source

**A/B Test Framework:**
```javascript
// Feature flag tracking
gtag('event', 'experiment_impression', {
  experiment_id: 'upgrade_modal_v2',
  variant_id: isTestGroup ? 'treatment' : 'control',
  experiment_name: 'what_why_how_now_framework'
});

// A/B test result tracking
gtag('event', 'experiment_result', {
  experiment_id: 'upgrade_modal_v2',
  variant_id: userVariant,
  result_type: 'conversion',
  success: didSubscribe
});
```

### **Implementation Priority:**

1. **Phase 1 (Immediate)**: Basic GA4 setup with core events
2. **Phase 2 (Week 2)**: Enhanced ecommerce and funnel tracking
3. **Phase 3 (Month 1)**: Custom dimensions and audience segmentation
4. **Phase 4 (Month 2)**: Advanced attribution and influencer ROI tracking

### **Data Privacy Compliance:**
- Cookie consent integration
- GDPR-compliant data collection
- User data export/deletion capabilities
- Transparent privacy policy with analytics disclosure

This analytics framework will provide unprecedented insights into user behavior, feature adoption, and conversion optimization opportunities, making AfterImage's analytics a true goldmine of actionable intelligence.

## Future Feature Roadmap

### **🔥 Share Visual Libraries Feature (v3.0 Concept)**

**Vision:** Transform AfterImage into a collaborative visual learning ecosystem where expert curators can share their refined reference collections.

#### **Core Concept**
Users can "snapshot" their personalized training lists + image collections and share them as read-only public libraries. Think Pinterest meets educational content sharing.

**User Story:**
> "I've spent months building the perfect 'Character Design Fundamentals' list with 200+ curated references across 50 subjects. Other artists should benefit from this research instead of starting from scratch."

#### **Technical Architecture**

**Database Schema Extensions:**
```sql
-- Shared library system
shared_libraries (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  original_list_id UUID REFERENCES custom_lists(id),
  title VARCHAR(255),
  description TEXT,
  snapshot_data JSONB, -- Frozen copy of list structure + metadata
  access_level VARCHAR(20) DEFAULT 'public', -- 'public', 'unlisted', 'private'
  featured BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Read-only access to shared reference collections
shared_library_images (
  id UUID PRIMARY KEY,
  shared_library_id UUID REFERENCES shared_libraries(id),
  drawing_subject VARCHAR(255),
  image_url TEXT,
  image_metadata JSONB, -- Original source, curator notes, etc.
  position INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User interactions with shared content
library_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  shared_library_id UUID REFERENCES shared_libraries(id),
  interaction_type VARCHAR(20), -- 'view', 'like', 'download', 'report'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community curation system
library_reviews (
  id UUID PRIMARY KEY,
  shared_library_id UUID REFERENCES shared_libraries(id),
  reviewer_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **User Experience Flow**

**1. Library Curation Phase:**
- User builds comprehensive training list over time
- Collects 50+ high-quality references across subjects
- Tests list effectiveness through practice sessions

**2. Share Creation:**
```typescript
// "Share This Library" button appears when:
// - List has 20+ subjects
// - 80%+ subjects have 3+ references
// - User has "expert" status (50+ practice sessions)

const shareLibrary = async (listId: string) => {
  const snapshot = await createLibrarySnapshot({
    listId,
    includeReferences: true,
    curatorNotes: true,
    usageStats: true
  })

  return await publishSharedLibrary({
    title: "Character Design Fundamentals",
    description: "Professional-grade references for anatomy, expressions, and poses",
    tags: ["character-design", "anatomy", "professional"],
    snapshot
  })
}
```

**3. Discovery & Consumption:**
- Browse "Community Libraries" section
- Filter by: skill level, art style, subject matter, curator rating
- Preview library structure before importing
- One-click import: "Add to My Lists"

**4. Import Experience:**
```typescript
// User imports shared library as read-only reference
const importLibrary = async (sharedLibraryId: string) => {
  // Creates local copy with original attribution
  const localList = await cloneSharedLibrary({
    sharedLibraryId,
    accessLevel: 'read-only',
    attribution: 'Curated by @expert_artist',
    allowModification: false
  })

  // User can practice but not modify original references
  return addToUserLists(localList)
}
```

#### **Monetization Opportunities**

**Creator Economy Model:**
- **Premium Curators**: Verified artists can monetize premium libraries ($5-15)
- **Tip System**: Users can tip excellent curators
- **Featured Placement**: Pay for discovery boost
- **Analytics Dashboard**: Curators see usage stats, popularity metrics

**AfterImage Revenue Streams:**
- 30% commission on premium library sales
- Featured library placement fees
- "Curator Pro" subscription tier ($19/month)
- Sponsored library partnerships with art schools

#### **Community Features**

**Quality Control:**
- Peer review system for featured libraries
- Automated quality scoring (reference count, user engagement)
- Report system for inappropriate content
- Curator reputation scoring

**Social Elements:**
```typescript
// Community interaction features
interface LibraryInteractions {
  likes: number
  downloads: number
  reviews: Review[]
  curatorFollowing: boolean
  suggestedImprovements: Suggestion[]
}
```

**Discovery Algorithm:**
- Trending libraries (download velocity)
- Personalized recommendations (practice history analysis)
- Skill-level matching (beginner vs advanced)
- Art style compatibility

#### **Technical Implementation**

**Phase 1: Core Sharing**
- Library snapshot/export system
- Basic read-only import functionality
- Community gallery with search/filter

**Phase 2: Social Features**
- Like/rating system
- Curator profiles and following
- Usage analytics for creators

**Phase 3: Monetization**
- Premium library marketplace
- Creator revenue sharing
- Advanced curation tools

**Phase 4: AI Enhancement**
- Smart library recommendations
- Auto-generated library descriptions
- Reference quality scoring

#### **Success Metrics**
- **Sharing Rate**: % of eligible users who create shared libraries
- **Import Rate**: Downloads per library view
- **Engagement**: Practice sessions using imported libraries
- **Creator Retention**: % of curators who publish multiple libraries
- **Revenue**: Premium library sales volume

#### **Competitive Advantages**
- **Practical Focus**: Unlike Pinterest, libraries are training-optimized
- **Quality Curation**: Human experts vs algorithm recommendations
- **Integrated Workflow**: Seamless practice → reference → improvement loop
- **Creator Attribution**: Proper credit and potential monetization for curators

This feature transforms AfterImage from a personal training tool into a collaborative learning ecosystem, creating network effects and establishing AfterImage as the definitive platform for visual art education.