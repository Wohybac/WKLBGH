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

## 2026-03-01: Sprint 4 Progress (WK-010)

### Sprint 4: Advanced Intelligence & Native Aesthetics
- [ ] **WK-010: Advanced Focus Selection** (In Progress)
    - Implemented "Focus Matrix" UI in settings with toggle logic.
    - Added mutual exclusion for "All" vs. specific filters.
    - Integrated manual filtering in `scanLearnedItems` for Level Spreads, "Most Recent", and "Leeches".
    - Updated Gemini prompt to include sampled "FOCUS ITEMS" from the filtered data.
    - Added persistence for focus settings using `GM_setValue`.

### Retrospective (Mid-Sprint):
- The manual filtering logic in `scanLearnedItems` was necessary because WKOF's built-in filters are best for simple ranges, but "Most Recent" and "Leeches" require more dynamic processing of the `ItemData` results.
- **Next Step:** Build and verify for syntax/type errors, then hand over for visual/functional testing.
