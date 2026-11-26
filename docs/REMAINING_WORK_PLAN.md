# Plan: Remaining work, module by module

**Sources:** `docs/UI_UX_AUDIT.md` (2026-11-23), `docs/ARCHITECTURE.md` §10, `.claude/plans/roadmap-p0-p3.plan.md`, post-deployment follow-ups
**Status checked against code:** 2026-11-26 (after the Vercel + Neon deployment)
**Order agreed:** Module 7 (mobile) first, starting with R1 + R2.

Sizes: **S** < 1 day · **M** 1–3 days · **L** more. 🗄 needs a Prisma schema change (ask first) · 📦 needs a new dependency (ask first).

## Done

| Source | Item | Evidence |
|---|---|---|
| Audit P0-1…5 | Editor emphasis, ⌘K opens task drawer, "Open full page" closes sheet, chart draws both series, quick-add destination | `ResourceEditor.tsx`, `CommandPalette.tsx`, `ProjectDetailSheet.tsx`, `lib/quickAddTarget.ts` |
| Audit P1-9 (part), P1-15, P2-12, P2-15 | Filter popover overflow, hidden panels `inert`, chart ticks, editor placeholder | `FilterPopover.tsx`, `AnimatedViewSwitch.tsx` |
| Roadmap P2-12 / P2-14 | Quick capture dialog with user shortcut; dashboard calendar | `QuickCaptureDialog.tsx`, `HQCalendarWidget.tsx` |
| Roadmap P0-1 (part) | Rate limiting: 10/15 min on login/register/refresh, 600/15 min global (in-memory, best-effort on serverless) | `apps/api/src/middlewares/rateLimit.middleware.ts` |
| Deploy | Vercel (web + api, `sin1`) + Neon, `/api/v1` proxy, first-party cookies, `ALLOW_REGISTRATION`, optional R2 | `docs/DEPLOYMENT.md` |

## Modules

### Module 0 · Production & ops (S)
- Set `ALLOW_REGISTRATION=false` once the owner has registered (owner's call).
- Preview env vars on both Vercel projects pointing at the **Dev** Neon branch, so previews run.
- `apps/web/.gitignore` hides `.env.local.example`; un-ignore it.
- Docs drift: `ARCHITECTURE.md` still says Railway / `SameSite=None` (§3, §6); mark rate limiting partly done (§10).
- Rest of P0-1: progressive delay on failed logins.

### Module 1 · Tasks (M)
P1-2 work-log UI (API exists) · P1-10 Done column clipped at 1440 · P1-17 card title is `<p onClick>`, focus lost on sheet close · P1-18 dnd announces raw ids · P1-9 filter count badge · P1-8 "Active Projects … represented" metric · P2-3/7/10 mute done cards, double date icon, quick-add stays open · roadmap P1-10 work-log edit/delete · roadmap P1-7 recurring tasks 🗄.

### Module 2 · Projects & areas (S–M)
P1-1 default color `#000000` → `#7c9cff` (shared schemas) · P1-11 Delete out of primary row into a "More" menu (5 places) · P2-1/2 metric strip style, plurals, one progress-bar color · P2-8/9 area "Edit" duplicate, status-label map, property alignment · project page double fetch.

### Module 3 · Resources & notes (M)
P1-4 "Saving… / Saved" status · P1-13 desktop two-column resource page (mobile part is R4.5) · P2-16/5 resource search/type filter, Notes tab count · roadmap P2-15 archive resources · R2 uploads (needs R2 keys; 503 until configured).

### Module 4 · Inbox (S)
P1-5 processed item links to its result · P1-6 process modal rules (required markers, error clears, unlinked resources, type select) · P2-14 labels + `role="tab"`.

### Module 5 · Archive (S)
P1-3 restore, search, "Archived" banner.

### Module 6 · HQ dashboard (S)
P1-7 activity rows show the item name (`metadata.title`) · P2-4 context-aware empty states.

### Module 7 · Mobile & responsive (L) — detailed below
Absorbs P1-14, P1-12, P2-17 and the phone part of P3-18.

**Progress (2026-11-26):** R1, R4.1, R4.3 done. R2 shipped, then replaced below `lg` by the bottom bar (`MobileTabBar`: Home · Tasks · + · Projects · More) with a + action sheet (Quick capture / Add task / Add project / Add resource) and a More sheet. Quick Capture is now Inbox-only and redesigned (full-screen on phones, dialog on web); desktop sidebar has the same "+ New" menu. Next: R3, R5, then R4.2/R4.4–R4.6 and R6.

### Module 7b · PWA & theming (M)
Roadmap P2-11 PWA/offline · P2-12 share target · P2-16 light theme.

### Module 8 · Auth & account (M–L)
P2-11 login `role="alert"`, skip session probe on auth routes · P2-13 Settings panel + avatar upload (needs R2) · roadmap P0-2 password reset / email verification 🗄📦 (decision D1: email provider) · roadmap P1-9 user timezone 🗄.

### Module 9 · Quality & platform (L)
Roadmap P0-3 Vitest (migrate 85 tests) + API integration + Playwright (with mobile device projects) + CI 📦 · P0-4 pino + error tracking 📦 (D2) · P1-5 pagination · P1-6 unified tags 🗄 · P1-8 full-text search 🗄 · P2-13 reminders/digest 📦 (D3) · P3 LazyMotion, blur fallback, Next upgrade.

**Ordering rule:** Module 9's test harness lands before any 🗄 item, because `main` deploys straight to production.

---

## Module 7 · Mobile & responsive — detailed plan

**Goal:** every route works and every action is possible by touch from a **320px** phone through tablets, portrait and landscape. No horizontal page scroll, no clipped text, nothing hover- or keyboard-only. No new dependencies (Tailwind v4 variants, existing Radix Dialog / `SheetContent`, dnd-kit `TouchSensor`).

**Layout bands:** `< sm` (640) phone · `sm–lg` tablet · `≥ lg` (1024) desktop, unchanged. Touch behaviour keys off `pointer-coarse`, not width.

**Test matrix:** 320, 360, 375, 390/393, 430 (phones) · 768, 820/834, 1024 (tablets) · portrait + landscape.

### Findings (2026-11-26)
| Area | Finding | Where |
|---|---|---|
| Shell | Sidebar is a fixed 256px column in `h-screen p-3`; ~30px left for content at 320. `sidebarOpen` exists but is unused | `AppShell.tsx`, `Sidebar.tsx`, `store/useUIStore.ts` |
| Viewport | `h-screen` (100vh) jumps under mobile toolbars; no safe-area handling | `AppShell.tsx`, `(app)/layout.tsx` |
| Header | Wide search with `⌘K`, full user name; nothing collapses | `Header.tsx` |
| Quick capture | Keyboard shortcut only (HQ widget aside) | `QuickCaptureDialog.tsx` |
| Breakpoints | `sm` 18×, `md` 3×, `lg` 22× in the whole app | — |
| Drag & drop | `PointerSensor` only: fights scroll on touch | `useBoardState.ts`, `TaskMonthCalendar.tsx` |
| Kanban | Fixed `w-72` columns, no snap, no non-drag move | `KanbanColumn.tsx`, `KanbanBoard.tsx` |
| Timeline | 288px label column; pointer drag without `touch-action` | `TimelineView.tsx` |
| Calendar | 7-col chips, ~44px cells at 320 | `TaskMonthCalendar.tsx` |
| Hover-only | `opacity-0 group-hover` actions invisible on touch (7 components) | `TaskCard`, `KanbanCard`, `SubtaskList`, `ProjectResources`, `ActiveProjects`, `TaskMonthCalendar`, `TimelineView` |
| Modals | Centered `max-w-lg p-6`, no gutter, no max height | `Modal.tsx`, `NewTaskModal.tsx` |
| Inputs | `text-sm` (14px) → iOS Safari zooms on focus | `Input.tsx`, `Textarea.tsx`, raw inputs |

### Phases
**R1 · Foundations (S)**
1. `viewport` export: `viewportFit: "cover"`, `themeColor`; pinch zoom stays enabled.
2. `h-screen` → `h-dvh`.
3. Safe-area padding on the shell and fixed elements.
4. Inputs ≥ 16px on coarse pointers (no iOS focus zoom); desktop unchanged.
5. Hover-only actions always visible on `pointer-coarse`.
6. ≥ 44px hit areas on small icon buttons on coarse pointers (invisible hit-area, no layout change).

**R2 · Navigation shell (M)**
1. Below `lg` the sidebar becomes a left drawer (`SheetContent side="left"`) driven by `sidebarOpen`; closes on navigation/Escape. `≥ lg` unchanged.
2. Header: menu button below `lg`; icon-only search below `sm`; `⌘K` hint hidden on touch; user name hidden below `sm`; tighter shell padding on phones.
3. Floating "+" capture button on coarse pointers (above the safe area) + "Quick capture" in the drawer.
4. Command palette full-screen on phones.
5. `sidebarOpen` defaults to closed.

**R3 · Overlays & forms (M)** — Modal becomes a bottom sheet below `sm` (`max-h-[90dvh]`, scroll body, sticky actions), `mx-4` gutter above; SlideOver full-screen with safe areas and an always-visible close (P1-12); form grids stack to 1 column (`NewTaskModal`, project/area modals, `ProcessModal`); IconPicker 6 cols; popovers clamp to the viewport or become bottom sheets; focused inputs scroll into view above the keyboard.

**R4 · Pages & lists (M)** — toolbars wrap, icon-only view switcher and "New"; Tasks/Projects default to List below `sm`; rows hide secondary meta below `sm`; metric strips/HQ 2-col with phone chart heights; detail pages stack properties below `lg`, editor toolbar scrolls; Inbox, Archive, Settings, auth pages checked at 320.

**R5 · Touch interactions (L)** — `MouseSensor` + `TouchSensor` (250ms long-press, 5px tolerance) + `KeyboardSensor`; Kanban `w-[85vw]` snap columns with sticky column tabs and drag auto-scroll; "Move to…" status menu on every card (non-drag path); calendar day dots + tap-to-open day sheet (grouping in `lib/calendarGrid.ts`, unit-tested); timeline `w-28` labels, long-press drag, tap opens sheet, `touch-action` on the track.

**R6 · Phone performance & polish (S)** — lighter blur on phones, `prefers-reduced-transparency` fallback, `prefers-reduced-motion` in drawer/sheets, landscape-phone check.

**R7 · Verification (every phase)** — DevTools emulation across the matrix on every route (no horizontal scroll: `scrollWidth === innerWidth`; no unnamed buttons; screenshots) · real-device pass on iOS Safari + Android Chrome by the owner · `pnpm typecheck && pnpm lint` + unit tests · Playwright mobile projects once Module 9 lands.

**Order:** R1 → R2 → R3 → (R4 ∥ R5) → R6. Estimate ~6–9 working days.

### Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Drawer `transform` becomes the DragOverlay containing block | Medium | Board never inside the drawer; overlay stays portaled to `body`; real drag after R2/R5 |
| Long-press drag vs iOS text selection/callout | Medium | `select-none` + `-webkit-touch-callout: none` on draggable cards only; tune delay on device |
| Bottom-sheet inputs hidden by the iOS keyboard | Medium | `dvh` + scroll-margin + device check; full-screen sheet fallback for long forms |
| Desktop regressions | Low | Changes scoped below `lg` or to `pointer-coarse`; 1440 screenshot after each phase |
| Glass blur stutters on low-end Android | Medium | R6 |

## Validation (every module)
```bash
R="$PWD"; pnpm --filter @mogoj/api exec tsx --test "$R"/apps/web/lib/*.test.ts "$R"/apps/api/src/modules/dashboard/*.test.ts
pnpm typecheck && pnpm lint
```
Plus browser checks against the running `make dev` (never `next build` while it runs).
