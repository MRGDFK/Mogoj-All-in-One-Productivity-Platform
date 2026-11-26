# Plan: Remaining work from the UI/UX audit and the architecture roadmap

**Sources:** `docs/UI_UX_AUDIT.md` (2026-11-23), `docs/ARCHITECTURE.md` §10, `.claude/plans/roadmap-p0-p3.plan.md`
**Status checked against code:** 2026-11-24
**Complexity:** Large overall. Phases A–C need no schema change and no new dependency. Phase D is the existing M1–M8 roadmap.
**Status:** awaiting confirmation. No code written yet.

## 1. What's already done

| Source | Item | Evidence in code |
|---|---|---|
| Audit P0-1 | Editor emphasis readable | `ResourceEditor.tsx:40` uses `prose-invert`; `globals.css:168` maps the prose tokens |
| Audit P0-2 | ⌘K task opens the drawer | `CommandPalette.tsx` `openTask()`; `/tasks?taskId=` deep link at `tasks/page.tsx:119` |
| Audit P0-3 | "Open full page" closes the sheet | `ProjectDetailSheet.tsx:99`, `ResourceDetailSheet.tsx:141` |
| Audit P0-4 | Chart draws both series | Replaced by Project Activity (two `Area`s) |
| Audit P0-5 | Quick-add no longer picks `[0]` | `lib/quickAddTarget.ts` + explicit destination select |
| Audit P1-9 (part) | Filter popover overflow | `FilterPopover.tsx:47` `align="end" collisionPadding` |
| Audit P1-15 | Hidden view panels out of the a11y tree | `AnimatedViewSwitch.tsx:40` `inert` |
| Audit P2-12 | Chart x-axis collisions | `interval="preserveStartEnd" minTickGap` |
| Audit P2-15 | Editor placeholder | TipTap `Placeholder` |
| Roadmap P2-12 | Global quick capture | `QuickCaptureDialog` with a user-defined shortcut (default ⌘⇧K, not ⌘⇧I) |
| Roadmap P2-14 | Dashboard calendar | `HQCalendarWidget` + `TaskMonthCalendar` (reads `/tasks?dueAfter&dueBefore`, not a `/dashboard` range) |
| Roadmap P0-3 (part) | Tests exist | 85 `node:test` tests; no Vitest, API integration, E2E or CI |

## 2. What remains

### Audit: P1 (still open)
| # | Item | Today |
|---|---|---|
| P1-1 | New projects/areas default to black | `project.schema.ts:8`, `area.schema.ts:7` `.default("#000000")` |
| P1-2 | Work-log UI | API `POST /tasks/:id/worklogs` exists; no component uses it |
| P1-3 | Archive: restore, search, banner | Copy promises "searchable and restorable"; none exists |
| P1-4 | Autosave status | No "Saving… / Saved" in resource/note editors |
| P1-5 | Processed inbox → link to the result | `InboxItemCard` doesn't read `promotedTo*Id` |
| P1-6 | Process modal rules | Required markers only for project; error doesn't clear; resource requires a link; no type selector |
| P1-7 | Activity rows without names | `ActivityFeed.tsx:28` shows `entityType` only |
| P1-8 | "Active Projects … represented" | `TaskMetricStrip.tsx:102` |
| P1-9 (rest) | No active-filter state on the Filter button | No count badge |
| P1-10 | Done column clipped at 1440 | `KanbanColumn.tsx:38` `w-72 shrink-0` |
| P1-11 | Delete is a solid red primary button | 5 places (`ProjectDetailSheet`, `ResourceDetailSheet`, project/area/resource pages) |
| P1-12 | Project sheet has no close button, thin content | `ProjectDetailSheet.tsx` |
| P1-13 | Resource page: editor below the fold, narrow | `resources/[id]/page.tsx` |
| P1-14 | Unusable under ~1024px | `sidebarOpen` / `toggleSidebar` still unused (= roadmap P2-11) |
| P1-16 | Unnamed icon buttons | `Modal.tsx` close × has no `aria-label`; card "More actions" etc. to sweep |
| P1-17 | Kanban title is `<p onClick>`; focus lost on sheet close | `TaskCardContent.tsx:35` |
| P1-18 | dnd-kit announces raw ids | `KanbanBoard.tsx` has no `accessibility.announcements` |

### Audit: P2 (still open)
1 metric strips match HQ `Stat` style + plurals ("1 Areas") · 2 progress bars `bg-brand` (3 places use emerald) · 3 mute done cards/rows · 4 context-aware empty states · 5 Notes tab count · 6 sheet focus ring / initial focus · 7 double date icon · 8 area "Edit" duplicate + one status-label map · 9 project page property alignment · 10 Kanban quick-add stays open · 11 login `role="alert"` + skip session probe on auth routes · 13 Settings glass panel + avatar upload · 14 inbox labels + `role="tab"` · 16 resources search/type filter · 17 header name hidden below `lg` · perf: project page fetches kanban + tasks for the same data.

### Roadmap (ARCHITECTURE §10): untouched
P0-1 rate limiting · P0-2 password reset / email verification · P0-3 Vitest + API integration + Playwright + CI · P0-4 pino + error tracking · P1-5 pagination · P1-6 unified tags · P1-7 recurring tasks · P1-8 full-text search · P1-9 user timezone · P1-10 work-log edit/delete · P2-11 mobile/PWA · P2-12 share target (rest) · P2-13 reminders/digest · P2-15 archive resources · P2-16 light theme · P3-17 LazyMotion · P3-18 blur fallback · P3-19 Next upgrade.

### Docs drift
- `ARCHITECTURE.md` doesn't mention throughput endpoint, Project Activity, Timeline, Calendar, quick capture shortcut, N-panel view switch; §8 lacks `GET /dashboard/throughput`; §9 test list is stale; §10 #12/#14 should be marked done.
- `CLAUDE.md` still says "There is no test suite".

## 3. Delivery order

```
Phase 0  Commit current work (your call)          ─┐
Phase A  Audit correctness + feedback (P1)          │ no schema, no deps
Phase B  Audit layout + accessibility (P1)          │
Phase C  Audit polish (P2) + docs sync             ─┘
Phase D  Roadmap M1 → M8 (existing plan, unchanged order)
```
Rationale: A–C are user-visible, small and low-risk; D starts with M1 (test harness) which then guards the riskier schema/auth work.

## Patterns to mirror
| Category | Source | Pattern |
|---|---|---|
| Pure logic + test | `apps/web/lib/quickAddTarget.ts`, `lib/shortcut.ts` + `.test.ts` | Logic in `lib/` with relative imports, `node:test` + `assert/strict` |
| Optimistic mutation | `hooks/useTasks.ts` `applyTaskPatch` / `revertTaskPatch` | Patch caches in `onMutate`, revert on error, invalidate on settle |
| Contract change | `packages/shared/src/schemas/*` | Shape first, then API service, then hooks |
| Activity write | `apps/api/src/modules/activity/` `writeActivityLog` | All services call it; add `metadata.title` there, not per caller where possible |
| Destructive confirm | `components/shared/ConfirmDialog.tsx` | Keep confirm; only change trigger prominence |
| Overflow menu | `components/shared/DropdownMenu.tsx` | Use for Delete moved off the primary row |
| Drawer | `useUIStore` + `SlideOver.tsx` | Clicks open sheets, never routes |

## Phase A · Correctness and feedback (audit P1)
| Task | Action | Test (RED first) |
|---|---|---|
| A1 · P1-1 default color | `.default(DEFAULT_ICON_COLOR)` (`#7c9cff`) in project + area schemas; inbox promote uses the same default. One-off SQL to recolor existing `#000000` rows (asks before running) | shared schema parse test: missing color → `#7c9cff` |
| A2 · P1-8 metric | Count distinct **active** projects with open tasks; relabel "Projects with open tasks" | `lib/taskMetrics` unit test |
| A3 · P1-7 activity names | `writeActivityLog` stores `metadata.title`; feed renders "Task *Renew passport* completed"; fallback to type for old rows; cap at 8 | `lib/activityLabel` unit test (with/without title) |
| A4 · P1-5 processed link | Card shows "→ Project: Garden redesign"; click opens the drawer (task/project/resource) | `lib/inboxTarget` unit test for each `promotedTo*Id` |
| A5 · P1-4 save status | `useAutosaveStatus(mutation)` → "Saving… / Saved / Failed to save" next to the editor toolbar | state-machine unit test |
| A6 · P1-6 process modal | Mark required fields up front, clear error on change, add resource type select. Allowing **unlinked** resources needs checking `processInboxItemSchema`; if it requires a link, relax it in shared + service | schema test: resource with no area/project accepted |
| A7 · P1-3 archive | Restore buttons (status → `active`, optimistic), search field (client filter), "Archived" banner on archived project/area pages | `lib/archiveFilter` unit test |
| A8 · P1-2 work log (add only) | "Progress log" section in the task panel using the existing mutation; edit/delete waits for roadmap P1-10 | browser check |

## Phase B · Layout and accessibility (audit P1)
| Task | Action | Check |
|---|---|---|
| B1 · P1-10 | Columns `flex-1 min-w-64` at ≥1280, horizontal scroll below; keep no `transform`/`filter` on ancestors | 4 columns visible at 1440; DragOverlay ancestor check |
| B2 · P1-11 | Delete moves into a `DropdownMenu` "More" on pages; ghost-destructive in sheets; `ConfirmDialog` kept | screenshot |
| B3 · P1-12 | Close button on the project sheet; add description, next 3 tasks, notes count | browser |
| B4 · P1-13 | Resource page: two columns (editor left, properties right), project-page width, Tasks linker reused from the sheet | browser at 1440 / 1024 |
| B5 · P1-9 | Active-filter count badge on the Filter button | `lib/` count unit test |
| B6 · P1-16 | `aria-label` on Modal close, IconPicker trigger, "More actions", any remaining editor buttons | DevTools a11y snapshot: no unnamed buttons |
| B7 · P1-17 | Title becomes a `<button>`; Radix `onCloseAutoFocus` restores focus to the trigger | keyboard walk-through |
| B8 · P1-18 | `accessibility.announcements` built from titles and column labels | `lib/dragAnnouncements` unit test |
| B9 · P1-14 (pulled forward from M7) | Sidebar collapses to a drawer below `lg` using `sidebarOpen`; menu button in header; sheets full-screen on mobile. PWA stays in M7 | browser at 768 / 500 |

## Phase C · Polish (audit P2) and docs
Batch the 15 open P2 items listed above in one pass (each is a few lines; screenshots as evidence). Then update `ARCHITECTURE.md` (§5, §6.6, §8, §9, §10 status) and `CLAUDE.md` (test command, Timeline/Calendar notes, `["throughput"]` key gotcha).

## Phase D · Roadmap M1–M8
Follow `.claude/plans/roadmap-p0-p3.plan.md` as written, with these updates:
- **M1:** migrate all 85 existing tests (not 3) to Vitest.
- **M6:** P2-14 done; M6 becomes timezone + recurring. The calendar and throughput must then read the user's timezone.
- **M7:** P2-12 done except the PWA share target; P2-11 sidebar drawer done in B9, leaving PWA/offline.
- Decisions still needed: **D1** email provider (M2), **D2** error tracking (M3), **D3** scheduler (M7).

## Validation (every phase)
```bash
pnpm --filter @mogoj/api exec tsx --test <abs paths of apps/web/lib/*.test.ts apps/api/src/**/*.test.ts>
pnpm typecheck && pnpm lint
```
Plus browser checks with the running `make dev`. Never `next build` while dev runs.

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Uncommitted work on `main` mixes with new phases | High | Phase 0: commit or branch first |
| Recoloring existing black entities overwrites a deliberate choice | Low | Only rows exactly `#000000`; ask before running |
| Relaxing the process-resource schema changes API behaviour | Low | Shared schema change + test; web and API updated together |
| Wider Kanban columns or a mobile drawer offset the DragOverlay | Medium | Re-run the ancestor style check and a real drag after B1/B9 |
| Activity `metadata.title` goes stale after renames | Low | Acceptable: it's a log of what the item was called then |

## Acceptance
- [ ] Every open audit P1 closed or explicitly deferred to a roadmap milestone
- [ ] Open P2 items closed with screenshots
- [ ] Docs match the code
- [ ] typecheck + lint + all tests green after each phase
