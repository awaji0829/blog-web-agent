1# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlogFlow is a React-based AI-powered blog content creation application. Users input resources (URLs/files), extract insights via AI, create outlines, and generate final drafts with SEO optimization.

**Tech Stack:**
- Frontend: React 18 + Vite + TypeScript
- Backend: Supabase (PostgreSQL + Edge Functions)
- AI: Anthropic Claude API (via Edge Functions)
- Styling: Tailwind CSS v4
- Routing: React Router v6

## Development Commands

```bash
npm i           # Install dependencies
npm run dev     # Start development server
npm run build   # Build for production
```

## Architecture

### Workflow State Machine

```
'input' → 'analyzing' → 'selection' → 'researching' → 'outline' → 'writing' → 'final'
```

### Route Structure

```
/        → Home (WorkflowContainer)
/saved   → Saved Drafts (SavedDraftsScreen)
```

### Directory Structure

```
src/
├── App.tsx                           # Main app with React Router
├── main.tsx                          # Entry point
├── components/
│   ├── shared/
│   │   ├── Layout.tsx                # Main layout (Header + Sidebar)
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   └── ProgressBar.tsx           # Step progress indicator
│   └── ui/                           # shadcn/ui components
├── features/
│   ├── workflow/
│   │   ├── WorkflowContainer.tsx     # Main workflow orchestrator
│   │   ├── hooks/
│   │   │   └── useWorkflow.ts        # Workflow state management hook
│   │   ├── components/
│   │   │   ├── ResourceInput.tsx     # URL/file input
│   │   │   ├── AnalysisLoading.tsx   # Analysis loading screen
│   │   │   ├── InsightSelectionScreen.tsx  # Insight selection
│   │   │   ├── DeepResearchLoading.tsx     # Research loading
│   │   │   ├── OutlineEditor.tsx     # Outline editing
│   │   │   └── FinalDraftScreen.tsx  # Final draft view + SEO
│   │   └── types/
│   │       └── index.ts              # All TypeScript types
│   └── drafts/
│       └── SavedDraftsScreen.tsx     # Saved drafts list
├── lib/
│   ├── api.ts                        # Supabase API functions
│   ├── supabase.ts                   # Supabase client
│   └── utils.ts                      # Utility functions (cn)
└── styles/
    └── index.css                     # Global styles

supabase/
├── migrations/
│   ├── 001_initial_schema.sql        # Initial DB schema
│   └── 002_add_seo_fields.sql        # SEO fields migration
└── functions/
    ├── collect-resource/             # URL scraping
    ├── extract-insights/             # AI insight extraction
    ├── deep-research/                # AI deep research
    ├── generate-outline/             # AI outline generation
    ├── write-draft/                  # AI draft writing
    └── analyze-seo/                  # SEO analysis
```

## Database Schema (Supabase)

### Tables

```sql
-- Workflow sessions
workflow_sessions (
  id UUID PRIMARY KEY,
  status TEXT,              -- input, analyzing, selection, researching, outline, final
  keywords TEXT,
  target_audience TEXT,
  created_at, updated_at
)

-- Collected resources
resources (
  id UUID PRIMARY KEY,
  session_id UUID FK,
  source_type TEXT,         -- url, file
  source_url TEXT,
  title TEXT,
  content TEXT,
  collected_at TIMESTAMPTZ
)

-- Extracted insights
insights (
  id UUID PRIMARY KEY,
  session_id UUID FK,
  title TEXT,
  signal TEXT,
  potential_angle TEXT,
  confidence TEXT,          -- high, medium, low
  relevance TEXT,
  tags TEXT[],
  status TEXT,              -- pending, selected, rejected
  source_refs JSONB
)

-- Deep research results
research (
  id UUID PRIMARY KEY,
  session_id UUID FK,
  insight_id UUID FK,
  topic TEXT,
  market_data JSONB,
  competitor_analysis JSONB,
  statistics JSONB,
  expert_opinions JSONB,
  related_trends JSONB,
  sources JSONB
)

-- Outlines
outlines (
  id UUID PRIMARY KEY,
  session_id UUID FK,
  research_id UUID FK,
  title TEXT,
  target_audience TEXT,
  thesis TEXT,
  tone TEXT,
  structure_pattern TEXT,
  sections JSONB,           -- [{id, type, title, content, keywords}]
  status TEXT               -- draft, approved
)

-- Final drafts
drafts (
  id UUID PRIMARY KEY,
  session_id UUID FK,
  outline_id UUID FK,
  title TEXT,
  subtitle TEXT,
  content TEXT,             -- Full markdown
  word_count INTEGER,
  char_count INTEGER,
  thumbnail_url TEXT,
  status TEXT,              -- draft, final, published
  seo_metrics JSONB,        -- SEO analysis results
  meta_description TEXT,
  primary_keywords TEXT[]
)
```

## API Layer (src/lib/api.ts)

```typescript
blogApi = {
  // Session
  createSession, getSession, updateSessionStatus,

  // Resources
  collectResource, addFileResource, getResources,

  // Insights
  extractInsights, getInsights, selectInsights, updateInsightStatus,

  // Research
  deepResearch, getResearch,

  // Outline
  generateOutline, getOutline, updateOutline, approveOutline,

  // Draft
  writeDraft, getDraft, updateDraft, publishDraft,
  getAllDrafts, getDraftById, deleteDraft,

  // SEO
  analyzeSeo, getSeoMetrics,
}
```

## Key Types (src/features/workflow/types/index.ts)

```typescript
type WorkflowStep = 'input' | 'analyzing' | 'selection' | 'researching' | 'outline' | 'writing' | 'final';

interface Draft {
  id: string;
  session_id: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  word_count: number;
  char_count: number | null;
  status: 'draft' | 'final' | 'published';
  seo_metrics: SeoMetrics | null;
  meta_description: string | null;
  primary_keywords: string[] | null;
  created_at: string;
}

interface SeoMetrics {
  overall_score: number;
  keyword_density: { score, value, status };
  readability: { score, avg_sentence_length, status };
  content_length: { score, word_count, char_count, status };
  heading_structure: { score, h2_count, h3_count };
  title_optimization: { score, length, has_keyword, status };
}
```

## Implementation Status

### Completed
- [x] React Router routing (/, /saved)
- [x] Supabase client setup
- [x] API layer (src/lib/api.ts)
- [x] useWorkflow hook for state management
- [x] Workflow step components (all 6 steps)
- [x] SavedDraftsScreen (list, search, delete)
- [x] Draft viewing from saved list
- [x] FinalDraftScreen with SEO analysis display
- [x] TypeScript types for all entities
- [x] DB migration files (001, 002)

### Pending (Edge Functions)
- [ ] collect-resource (URL scraping)
- [ ] extract-insights (Claude AI)
- [ ] deep-research (Claude AI + web search)
- [ ] generate-outline (Claude AI)
- [ ] write-draft (Claude AI - Opus recommended)
- [ ] analyze-seo (SEO scoring algorithm)

## Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Functions (in Supabase dashboard)
ANTHROPIC_API_KEY=your-anthropic-key
```

## Key Components Flow

### Viewing Saved Draft
1. SavedDraftsScreen: Click card → `onViewDraft(draft)`
2. App.tsx: `setViewDraft(draft)` → `navigate('/')`
3. WorkflowContainer: `initialDraft` prop triggers useEffect
4. useEffect: `workflow.setDraft()` + `workflow.setStep("final")`
5. FinalDraftScreen: Renders draft content + SEO analysis

### Creating New Draft
1. ResourceInput: Enter URLs, keywords, target audience
2. handleStartAnalysis → `blogApi.createSession()` → `blogApi.collectResource()` → `blogApi.extractInsights()`
3. InsightSelectionScreen: Select insights → `blogApi.selectInsights()` → `blogApi.deepResearch()`
4. OutlineEditor: Edit outline → `blogApi.updateOutline()`
5. handleFinalDraft → `blogApi.writeDraft()`
6. FinalDraftScreen: View/edit draft → `blogApi.publishDraft()`

## Notes for Development

- Path alias `@` maps to `./src`
- Tailwind CSS v4 via `@tailwindcss/vite`
- Icons from `lucide-react`
- Animations via `motion/react` (Framer Motion)
- Forms use `react-hook-form`
- UI components from shadcn/ui (Radix UI based)

## Related Resources

- Plan file: `.claude/plans/shiny-moseying-wreath.md` (detailed implementation plan, included in repo)
