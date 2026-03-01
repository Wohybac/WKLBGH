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

### Sprint 4: Advanced Intelligence & Native Aesthetics
- [x] **WK-010: Advanced Focus Selection** (Complete)
    - Implemented "Focus Matrix" UI in settings with toggle logic.
    - Added mutual exclusion for "All" vs. specific filters.
    - Integrated manual filtering in `scanLearnedItems` for Level Spreads, "Most Recent", and "Leeches".
    - Updated Gemini prompt to include sampled "FOCUS ITEMS" from the filtered data.
    - Added persistence for focus settings using `GM_setValue`.
    - Implemented "Option 1" for focus logic (allows empty selection, disables generation with warning).

### Retrospective:
- **Major Milestone:** Achieved v0.2.0 with targeted study logic.
- **Bug Discovery:** Identified that `window.wkof` detection is failing in some environments (WK-016). This will be the priority for the next sprint.
- **UI Scaling:** Noted that the injection is causing some dashboard header stretching; added WK-017 to the backlog to address this in the UI Refinement phase.
- **Process Improvement:** Synchronizing version numbers in `vite.config.ts` and `package.json` is critical for release consistency.

## 2026-03-01: Sprint 5 Completion (v0.2.8) - Stability & Connectivity

### Bugfix: WKOF Scan Hang & Detection
- [x] **WK-016: Bugfix - WKOF Detection** (Complete)
    - Switched to `unsafeWindow` and `document-start` for early detection.
- [x] **WK-018: Bugfix - WKOF Scan Hang** (Complete)
    - Identified that `srs_stage` filter required an external WKOF module. Moved SRS filtering to local JS logic.
    - Integrated `review_statistics` for accurate "Leech" detection (Score: `incorrect / srs_stage^1.5`).
    - Added 15s safety timeouts and detailed console logging for better diagnostics.

### Retrospective:
- **Filtering Logic:** Current filters are additive (Level 1-10 OR Leeches). User feedback suggests intersection (Leeches FROM Level 1-10) is preferred. Added WK-019 to Backlog.
- **Injection Issues:** Discovered that the script is currently active on the "Settings" page and other non-dashboard pages, causing layout issues. WK-017 is now a high priority.
- **Technical Growth:** The script is now highly robust, with clear logging and improved sandbox compatibility.
