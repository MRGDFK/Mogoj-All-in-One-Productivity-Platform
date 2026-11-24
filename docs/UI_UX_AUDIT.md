# Mogoj: live UI/UX & interactive QA audit

**Date:** 2026-11-23 · **Build:** local `make dev` (web :3000, api :4000), Next.js 15.5 dev mode
**Account:** seeded `demo@mogoj.app` · **Viewports:** 1440, 768, 500 (browser minimum; 390 not reachable)
**Method:** real clicks, typing and pointer-driven drags in Chrome via DevTools automation, plus console/network capture and DOM/computed-style inspection. Audit only; no app code changed.

## What works well
- Inbox capture is fast: Enter-to-add keeps focus, sidebar count updates instantly, items promote to task/project/resource and animate out.
- Kanban: priority strips, column hues and the `DragOverlay` portal all work. Mid-drag the ghost sat exactly at pointer − grab offset over blurred glass. Moves are optimistic and persist.
- `.breathe-critical` behaves as specified: breathes on open critical items (card strip, list pill, priority select), stops immediately when moved to Done.
- Task detail edits (title, priority, due date, subtasks) propagate live to the board (strip, "Today" badge, `0/1` footer) without reload.
- Inline renames (project, area) sync to the sidebar; the area-delete restriction surfaces as a clear toast.
- No React errors or hydration warnings were seen; all mutations returned 2xx.

---

## P0: broken flows / blockers

### P0-1 · Rich-text headings, bold, links, quotes and code are near-black on the dark theme
- **Where:** TipTap editor on resource pages and note sheets: `components/resources/ResourceEditor.tsx` (editor class `prose prose-sm …`).
- **Repro:** `/resources/:id` → type `## Heading` or bold text. Computed `--tw-prose-headings`, `--tw-prose-bold`, `--tw-prose-links`, `--tw-prose-quotes` and `--tw-prose-code` all resolve to `oklch(21% 0.034 264.665)` on a ~`#0a0b0e` background.
- **Why it hurts:** whatever the user emphasises becomes invisible. Paragraphs are readable only because `text-foreground` overrides body color.
- **Fix:** add `prose-invert`, or map the `--tw-prose-*` variables to tokens (`--foreground`, `--brand` for links, `--muted-foreground` for quotes) once in `globals.css`.

### P0-2 · ⌘K task results are dead clicks
- **Where:** `components/layout/CommandPalette.tsx:63` links tasks to `/tasks?taskId=…`; nothing reads `taskId`.
- **Repro:** ⌘K → type "pass" → ↓ Enter → lands on `/tasks?taskId=…`; no task opens.
- **Why it hurts:** search finds the task, then drops the user on an unfiltered board.
- **Fix:** in the palette, call `useUIStore.openTaskDetail(id)` (it's a cross-page drawer) instead of routing. Optionally also read `taskId` in `app/(app)/tasks/page.tsx` for deep links.

### P0-3 · "Open full page" leaves the project sheet covering the page it opened
- **Where:** `components/projects/ProjectDetailSheet.tsx` ("Open full page" link); `projectDetailId` in `store/useUIStore.ts` isn't cleared.
- **Repro:** `/projects` → click a project name → "Open full page". URL changes to `/projects/:id`, but the sheet stays open over it.
- **Why it hurts:** the user must dismiss a panel to see the page they asked for, and it looks like nothing happened.
- **Fix:** call `closeProjectDetail()` in the link's `onClick`. Same check for the resource sheet's equivalent link.

### P0-4 · "Created vs completed" chart never draws the Created series
- **Where:** `components/dashboard/ThroughputChart.tsx`: a recharts `<Line>` inside `<AreaChart>` isn't rendered.
- **Repro:** HQ → DOM has 1 `.recharts-area`, 0 `.recharts-line`; tooltip lists only "Completed" even after creating tasks.
- **Why it hurts:** the dashboard's main chart shows half its story and a legend entry that matches nothing.
- **Fix:** switch to `ComposedChart` (keeps `Area` + `Line`), or render Created as a second `<Area>` with no fill.

### P0-5 · Kanban quick-add on /tasks silently files tasks under an arbitrary project and area
- **Where:** `app/(app)/tasks/page.tsx:82-90`: `defaultProjectId = projects[0]`, `defaultAreaId = areas[0]`.
- **Repro:** `/tasks` → Kanban → "Add task" in To do → type → Enter. Card shows "Launch Portfolio Site · Work", which was never chosen.
- **Why it hurts:** wrong data written without consent; the task appears inside a project the user didn't pick.
- **Fix:** on the global board, send unassigned tasks to an explicit target (show a small area/project picker in the quick-add row), or route quick-add through the inbox. Never pick `[0]`.

---

## P1: high-impact UX friction

### Data & feedback
| # | Page / component | What happened | Why it hurts | Fix |
|---|---|---|---|---|
| 1 | New projects/areas · `packages/shared/src/schemas/{project,area}.schema.ts` (`color` default `#000000`) | Project promoted from inbox shows a black rocket icon, nearly invisible on dark | Entities created without a color are unreadable | Default to `ICON_COLORS[0]` (`#7c9cff`) in the schemas and the inbox-promote service |
| 2 | Task detail · `hooks/useTasks.ts:171` | Work-log mutation exists but no component uses it; no work-log UI anywhere | Feature listed in `docs/ARCHITECTURE.md` is unreachable | Add a work-log section to `TaskDetailPanel`, or remove the claim from the doc |
| 3 | Archive · `app/(app)/archive/page.tsx` | Copy says "searchable and restorable"; there's no search and no Restore. Restoring means opening the project and changing status. Archived project page has no "Archived" banner | Promised affordance missing; restore is undiscoverable | Add Restore buttons (status → active), a search field, and an archived banner on detail pages |
| 4 | Notes/resource editor autosave | PATCH fires ~1s after typing; no "Saving… / Saved" indicator | Users can't tell if work is safe | Small status text near the editor toolbar driven by the mutation state |
| 5 | Inbox → Processed tab · `components/inbox/InboxItemCard.tsx` | Rows show original capture type ("Task") + "Processed"; no link to what it became | Can't trace where an item went | Show "→ Project: Garden redesign" with a link, using `promotedTo*Id` |
| 6 | Process modal · `components/inbox/ProcessModal.tsx` | Task: Area not marked required, error appears only after submit and stays after picking an area. Resource: requires area/project (PARA resources are standalone; `/resources` allows none) and offers no resource type | Rules discovered by failure; inconsistent with Resources page | Mark required fields up front, clear the error on change, allow unlinked resources, add a type selector |
| 7 | HQ Recent activity · `components/dashboard/ActivityFeed.tsx` | Rows read "Task updated", "Project updated" with no names; list grows unbounded (~20 rows in this session) | Low information, long scroll | Include entity title (store it in `metadata` on write), cap at ~8 with "View all" |
| 8 | Tasks metric strip · `components/tasks/TaskMetricStrip.tsx` | "Active Projects 3 represented" while 2 projects are active | Misleading number | Count distinct active projects, or relabel ("Projects with open tasks") |

### Interaction & layout
| # | Page / component | What happened | Why it hurts | Fix |
|---|---|---|---|---|
| 9 | Filter popover · `components/shared/` filter (Tasks/Projects) | Popover overflows the right edge at 1440; values wrap ("Any / date") and are clipped. After filtering, the icon-only Filter button shows no active state | Hidden controls; board silently looks incomplete | `collisionPadding` + `align="end"` + wider min-width; badge with active-filter count on the button |
| 10 | Kanban at 1440 · `components/projects/KanbanColumn.tsx` (`w-72`) | 4 × 288px + gaps exceed the content width; Done column is cut off behind a horizontal scrollbar | The "finished" column, the payoff, is hidden at a common desktop width | `flex-1 min-w-64` columns so 4 fit at ≥1280; keep horizontal scroll only below that |
| 11 | Destructive buttons · `ProjectDetailSheet`, `projects/[id]`, `areas/[id]`, `resources/[id]` | "Delete" is a solid red primary button, often the largest control | Most dangerous action is the most prominent | Move to an overflow menu or use the ghost/outline destructive variant |
| 12 | Project sheet · `ProjectDetailSheet.tsx` | No close button (task/note sheets have one); only metadata + delete | Escape/outside-click only; sheet adds little over the card | Add a close button; show description, next tasks and notes count |
| 13 | Resource page · `app/(app)/resources/[id]/page.tsx` | Narrow centered column, lone Delete row above title; editor (the content) is last, below the fold; tasks can be linked only from the sheet, not here | Content is secondary; inconsistent with the full-width project page | Editor first (or two-column: content left, properties right), match project page width, add Tasks linker |
| 14 | Tablet/mobile · `components/layout/AppShell.tsx`, `Sidebar.tsx` | Sidebar fixed 256px at every width; at 500px main is 208px, header clipped, chart overflows; `sidebarOpen` in `useUIStore` unused | App is unusable below ~1024px | Collapsible sidebar/drawer below `lg` (roadmap P2-11, but a P1 experience issue) |

### Accessibility
| # | Page / component | What happened | Why it hurts | Fix |
|---|---|---|---|---|
| 15 | Hidden view panels · `components/shared/AnimatedViewSwitch.tsx` | List and Card views stay in the a11y tree while Kanban is shown; every task is announced 3× | Screen-reader noise; duplicate tab stops | Set `inert` + `aria-hidden` on inactive panels (keeps them mounted) |
| 16 | Unnamed icon buttons | Editor toolbar (8 buttons), modal/dialog close ×, icon-picker trigger, card-view "More actions" have no accessible name | Unusable with assistive tech | `aria-label` on each (Bold, Italic, Heading, …, Close, Change icon, More actions) |
| 17 | Kanban card title · `components/tasks/TaskCardContent.tsx` | Title that opens details is a `<p onClick>`; not focusable. Closing the sheet returns focus to `<body>` | Keyboard users can't open details except via the overflow menu, and lose their place | Make the title a `<button>`; restore focus to the trigger on close (Radix `onCloseAutoFocus`) |
| 18 | dnd-kit announcements · `components/projects/KanbanBoard.tsx` | Live region reads "Draggable item cmwt6knhx… was dropped over droppable area cmwt6knhx…" | Meaningless to screen-reader users | Pass `accessibility.announcements` using task titles and column labels |

---

## P2: visual & polish

| # | Page / component | Issue | Fix |
|---|---|---|---|
| 1 | Tasks/Projects metric strips | Colored icon squares and Title Case labels ("Active Projects", "Due Soon") clash with HQ's plain sentence-case tiles; "1 Areas" | Reuse HQ `Stat` style; sentence case; pluralize |
| 2 | Project progress bars | Emerald on card/sheet/page vs brand blue on HQ and Kanban | Use `bg-brand` everywhere |
| 3 | Done items | Done cards keep loud priority strips; area task list shows done tasks with a red Critical pill and no done styling | Mute strips (`opacity-60`) and strike/dim done rows |
| 4 | Empty states | Empty project list view says "Try adjusting your filters" with no filters; empty Kanban column shows "No tasks" mid-drag with no drop preview | Context-aware copy; highlight drop slot |
| 5 | Project tabs | "Notes" tab has no count while "Tasks 4" and "Resources 1" do | Add count |
| 6 | Sheets | Task and note sheets draw a blue focus ring around the whole panel when opened | `focus-visible:outline-none` on `Dialog.Content`; move initial focus to the title |
| 7 | Date fields | Native date inputs show a decorative calendar icon and the browser's own (two icons) | Drop one; consider a shared date-picker |
| 8 | Area page | "Edit" button duplicates the inline-editable name; "On Hold" vs "On hold" elsewhere | Remove/rename Edit; one status label map |
| 9 | Project page | Description box ~7px left of the properties panel and styled differently; Area select borderless while Priority is bordered; properties panel half-empty | Align to panel; consistent select style; two-column properties |
| 10 | Kanban quick-add | Input closes after each add (inbox keeps focus for rapid entry) | Keep open and focused after Enter |
| 11 | Login | Error text not announced (not `role="alert"`); signed-out `/login` logs red 401s for `/auth/me` and `/auth/refresh` | `role="alert"`; skip the session probe on auth routes |
| 12 | HQ chart <900px | X-axis labels collide ("Nov 16Nov 23"), last label clipped | `interval="preserveStartEnd"` / `minTickGap` |
| 13 | Settings | No glass panel unlike other pages; avatar by URL only (R2 upload exists); "preferences" promised but none | Panel + upload + real preferences (timezone) |
| 14 | Inbox | Capture input and type select have no labels; tabs are buttons, not `role="tab"` | `aria-label`s; tablist semantics in `Tabs` |
| 15 | Editor | Empty editor has no placeholder | TipTap Placeholder extension |
| 16 | Resources list | No search, filter or type tabs | Add search + type filter |
| 17 | Header at 768 | User name wraps to two lines | Hide name below `lg`, avatar only |

---

## Console & network summary
- **Errors:** only expected 401s (signed-out session probe on `/login`, one deliberate wrong-password attempt).
- **Issues panel:** "A form field element should have an id or name attribute" (×4).
- **Mutations:** all 2xx (`POST /inbox/:id/process` ×3, task/project/area/note/resource PATCH/POST, area DELETE correctly rejected and surfaced as toast).
- **Perf note:** project page fetches both `/projects/:id/kanban` and `/tasks?projectId=…` for the same data.

## Doc correction
`docs/ARCHITECTURE.md` §5 lists "work logs" under Tasks; the UI doesn't expose them (P1-2). Update the doc or ship the UI.

## Test data created during the audit
Left in the demo account (delete when done): inbox items "QA audit: …" (3 processed), task "QA audit: renew passport (edited)" with subtask "Find old passport photos", task "QA audit: quick-added in column", project "QA audit: plan garden redesign", resources "QA audit resource" (tag "learning") and "QA audit: article on spaced repetition", note "QA audit note". "Build hero section" was moved to Done; "Work" area and profile name were renamed and restored.

---

## Top 5 fixes, in order of impact
1. **Make editor emphasis readable (P0-1):** add `prose-invert` / token-mapped `--tw-prose-*`. One class, fixes every heading, bold, link and quote in the app.
2. **Fix the two navigation-state bugs (P0-2, P0-3):** ⌘K task results open the task drawer; "Open full page" closes the sheet. Both are a single call each.
3. **Stop writing data the user didn't choose (P0-5, P1-1):** explicit destination for Kanban quick-add; default entity color `#7c9cff` instead of black.
4. **Repair the dashboard story (P0-4, P1-7):** `ComposedChart` so Created renders; activity rows with entity names and a cap.
5. **Keyboard & screen-reader pass (P1-15…18):** `inert` hidden view panels, names on icon buttons, title as button with focus restore, readable drag announcements.
