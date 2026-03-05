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

## 2026-03-03: Sprint 7 Completion (v0.2.14) - Robustness & Testing

### Sprint 7: Testing Suite
- [x] **WK-011: Testing Suite** (Complete)
    - Integrated **Vitest** + **JSDOM** + **React Testing Library**.
    - Refactored core logic into `logic.ts` for modularity and testability.
    - Implemented unit tests for item filtering, SRS leech calculations, and level spread logic.
    - Mocked Tampermonkey APIs and WKOF to enable CI-ready testing.
    - Verified 7/7 tests passing.

### Retrospective:
- **Testability through Refactoring:** Decoupling logic from React components (`App.tsx`) significantly simplified testing and improved code readability.
- **Mocking Strategy:** Mocking `unsafeWindow` and `GM_` functions is critical for userscript development to avoid environment-specific crashes during testing.

## 2026-03-06: Sprint 8 Completion (v0.2.14) - Gemini API Fix & Testing

### Bugfix: Gemini API Connection
- [x] **WK-020: Gemini Integration Fix** (Complete)
    - Added `@connect` metadata for `api.wanikani.com` and `generativelanguage.googleapis.com` in `vite.config.ts`.
    - Switched from `v1beta` to `v1` endpoint for better stability.
    - Implemented a self-healing auto-discovery mechanism: fetches available models, filters for `generateContent` support, and prioritizes variants of 1.5 Flash.
    - Added a "ping" test to ensure model viability before use.
    - Added persistence via `GM_setValue` to save the working model ID and bypass future discovery steps.
    - Synchronized version to `0.2.14` across `package.json`, `vite.config.ts`, and `main.tsx`.

### Retrospective:
- **CORS/CSP Metadata:** Userscripts require explicit `@connect` permissions for cross-origin requests when using `GM_xmlhttpRequest`.
- **API Fragility & Auto-Discovery:** Hardcoding model IDs (like `gemini-1.5-flash`) can lead to 404s depending on the specific API token's permissions or regional rollouts. An auto-discovery approach that queries `/v1/models` and tests viability makes the integration significantly more robust.
