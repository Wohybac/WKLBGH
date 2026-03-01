# Development Diary

## 2026-02-28: Session 1 Wrap-up (Sprints 1-3)

### Sprint 1: Scaffolding
- [x] Initialized Vite + React + TS environment.
- [x] Connected to GitHub.

### Sprint 2: API & Visuals
- [x] Implemented WaniKani & Gemini API logic.
- [x] Solved injection issues using "Sibling DOM" strategy.
- [x] ACHIEVED VISUAL DELIVERY on the dashboard.

### Sprint 3: WKOF & Elegance
- [x] Integrated **WaniKani Open Framework (WKOF)**.
- [x] Updated data scanner to use `wkof.ItemData` for high-performance caching.
- [x] Fixed "Black Background" CSS bug by cleaning up global styles.
- [x] Established proper versioning (Final: v0.1.1).

## 2026-03-01: Sprint 4 Completion (v0.2.0)

### Sprint 4: Advanced Focus Selection
- [x] **WK-010: Advanced Focus Selection** (Complete)
    - Implemented "Focus Matrix" UI in settings with toggle logic.
    - Added mutual exclusion for "All" vs. specific filters.
    - Integrated manual filtering in `scanLearnedItems` for Level Spreads, "Most Recent", and "Leeches".
    - Updated Gemini prompt to include sampled "FOCUS ITEMS" from the filtered data.
    - Added persistence for focus settings using `GM_setValue`.
    - Implemented "Option 1" for focus logic (allows empty selection, disables generation with warning).

## 2026-03-01: Sprint 5 Completion (v0.2.8) - Stability & Connectivity

### Bugfix: WKOF Scan Hang & Detection
- [x] **WK-016: Bugfix - WKOF Detection** (Complete)
- [x] **WK-018: Bugfix - WKOF Scan Hang** (Complete)
    - Moved SRS filtering to local JS logic.
    - Integrated `review_statistics` for accurate "Leech" detection.

## 2026-03-01: Sprint 6 Completion (v0.2.13) - UI Layout & Scoping

### Bugfix: UI Layout & Scoping
- [x] **WK-017: Bugfix - UI Layout & Scoping** (Complete)
    - Implemented **"Virtual Widget"** system to mimic native dashboard behavior.
    - Added **MutationObserver** to handle WaniKani's dynamic DOM loading (fixed "parameter 1 is not a Node" error).
    - Added **Widget Placement** setting: Top, Below Level Progress, or Bottom.
    - Wrapped injection in native `.dashboard__row` and `.dashboard__widget` classes to fix layout stretching.
    - Implemented a "Dismiss" (✖) button for session-based modularity.
    - Restored detailed informative status messages (Level, item counts) that were regressed during troubleshooting.

### Retrospective:
- **Injection Resilience:** MutationObserver is essential for WaniKani's modern dashboard, as elements load at different times.
- **Native Alignment:** Using native classes like `.dashboard__row` is safer than raw positioning for long-term stability.
