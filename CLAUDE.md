# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual Library Trainer is a React web application that helps artists build visual memory and drawing skills. The app presents random subjects for users to draw from memory, then provides reference materials for study and improvement.

## Technology Stack

- **Frontend**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.13
- **Icons**: Lucide React
- **Package Manager**: npm

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
- to memorize