# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlogFlow is a React-based interactive content creation application built with Vite. It provides a multi-step UI for creating blog content through AI-assisted workflows where users input resources (URLs/files), extract insights, create outlines, and generate final drafts.

## Development Commands

```bash
npm i           # Install dependencies
npm run dev     # Start development server with HMR
npm run build   # Build for production
```

Note: No test or lint scripts are currently configured.

## Architecture

### State Machine Flow

The app uses a step-based state machine in `App.tsx` with the following flow:
```
'input' → 'analyzing' → 'selection' → 'researching' → 'outline' → 'final'
```

Each step renders a dedicated component:
- `ResourceInput.tsx` - Step 1: URL/file input form
- `AnalysisLoading.tsx` - Step 2: Loading animation during analysis
- `InsightSelectionScreen.tsx` - Step 3: Select AI-extracted insights
- `DeepResearchLoading.tsx` - Step 4: Deep research loading state
- `OutlineEditor.tsx` - Step 5: Multi-section outline editor
- `FinalDraftScreen.tsx` - Step 6: Final draft with AI tools

### Directory Structure

```
src/
├── main.tsx                    # React DOM entry point
├── app/
│   ├── App.tsx                 # Main app with state machine
│   ├── components/
│   │   ├── ui/                 # 50+ shadcn/ui components (Radix UI based)
│   │   ├── figma/              # Figma-specific components
│   │   ├── Layout.tsx          # Main layout with header & sidebar
│   │   └── [step components]   # Feature components for each step
│   ├── lib/
│   │   └── utils.ts            # cn() utility for Tailwind class merging
│   └── styles/
│       ├── index.css           # Main style entry
│       ├── theme.css           # Design tokens (oklch colors, CSS variables)
│       └── tailwind.css        # Tailwind configuration
```

### Key Technical Details

- **Path alias**: `@` maps to `./src`
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **Color system**: oklch() color space for perceptual uniformity
- **Dark mode**: Supported via `next-themes` with `.dark` class selector
- **Component variants**: Uses `class-variance-authority` for variant management
- **Icons**: lucide-react
- **Animations**: motion/react (Framer Motion)
- **Forms**: react-hook-form

### Current State

The app currently uses mock data and simulated workflows (setTimeout for demo timing). There is no backend integration - all interactions are UI-only demonstrations.
