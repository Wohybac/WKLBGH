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

## 2026-03-06: Sprint 10 Completion (v0.2.16) - Interactive Lesson UI

### Feature: Lesson UI/UX Flow
- [x] **WK-022: Lesson UI/UX Flow** (Complete)
    - Implemented a robust state machine (`idle`, `generating`, `ready`, `active`, `results`) in `App.tsx` to handle the user journey.
    - Defined comprehensive TypeScript interfaces (`Lesson`, `Question`, `Option`) based on the expected Gemini JSON schema.
    - Built the `active` view: displays the sentence, tracks the current question, and provides immediate visual feedback (green/red) upon selecting an answer.
    - Built the `results` view: calculates and displays a final tally of correct, incorrect, and skipped questions.
    - **QA:** Refactored the `parseGeminiResponse` function out of `App.tsx` and into `logic.ts`. Added specific Vitest unit tests to ensure it correctly strips markdown wrappers (` ```json `) from LLM responses. Tests passed (10/10).
    - Updated version to `0.2.16`.

### Retrospective:
- **Test-Driven Architecture:** The requirement to test the JSON parser forced us to decouple it from the React component, resulting in cleaner, more modular code.
- **State Management:** Using a single string literal type (`AppState`) is much safer and easier to track than multiple boolean flags (`isGenerating`, `isReady`, etc.) when managing distinct UI views.

## 2026-03-07: Sprint 11 Completion (v0.2.17) - UI Refinement & Rebranding

### Feature: Native WaniKani Widget Styling & WKU Rebranding
- [x] **WK-013: UI Refinement** (Complete)
    - Completely restructured the React UI in `App.tsx` and `App.css` to match the native WaniKani dashboard widget aesthetics.
    - Implemented a standard flex layout with an icon column and content column.
    - Designed 3D-style action buttons using a unified WaniKani grey color palette, removing the generic blue styling.
    - Addressed global CSS leakage by rigidly namespacing all component classes, ensuring no interference with native dashboard widgets.
    - Added bottom-margin spacing to integrate naturally into the page's widget flow.
- [x] **Rebranding: WaniKani Ushi (WKU)**
    - Rebranded the project from "WKLBGH" to "WaniKani Ushi" (WKU).
    - Designed and implemented a custom `CowSVG` component matching the bold-outline WaniKani illustration style.
    - Added stateful variants to the mascot (e.g., chewing grass in the settings menu).

### Retrospective:
- **CSS Isolation:** When injecting into a complex, pre-existing environment like WaniKani, it is critical to aggressively namespace all CSS classes. Using generic names like `.wk-button` caused immediate layout collisions.


## 2026-03-07: Sprint 12 Completion (v0.3.0) - JLPT Difficulty Selectors

### Feature: Difficulty-Aware Generation
- [x] **WK-023: JLPT Difficulty Settings** (Complete)
    - Added UI in the Settings menu for selecting targeted JLPT levels (N5-N1).
    - Enabled multiple selections by toggling individual difficulty levels.
    - Stored preferences persistently using `GM_setValue('wklbgh_jlpt_settings')`.
- [x] **WK-024: Difficulty-Aware Prompting** (Complete)
    - Updated `buildGrammarLessonPrompt` in `prompts.ts` to conditionally accept `jlptSettings`.
    - Implemented prompt logic to explicitly instruct Gemini to only include selected JLPT levels, and expressly *exclude* deselected levels, to heavily constrain the generation.

### Retrospective:
- **Prompt Engineering constraints:** Telling the LLM *what not to do* (exclusion of unselected levels) is equally as important as telling it what to focus on when managing difficulty boundaries.


## 2026-03-07: Sprint 13 Completion (v0.4.0) - Global User Statistics

### Feature: Global User Statistics
- [x] **WK-026: Global User Statistics** (Complete)
    - Created a new `GlobalStats` interface to track correct, incorrect, and skipped answers.
    - Integrated data persistence tying statistics specifically to the user's WaniKani API key via `GM_setValue('wklbgh_stats_${apiKey}')`, preventing cross-account data leakage.
    - Created a new "Ushi Statistics" view to display the aggregated data.
    - Tracked and displayed the `first_lesson_date` and `last_lesson_date`.
    - Added a "Global Stats" (📊) button to the main widget header.
    - Created UI integration tests using React Testing Library to verify state toggling.

### Retrospective:
- **State Encapsulation:** Decoupling the view states (`showSettings`, `showStats`, and `appState`) ensures that the main widget flow remains undisturbed while allowing modular features to easily overlay the dashboard.


## 2026-03-07: Sprint 14 Completion (v0.4.1) - Filter Logic Refinement

### Feature: Intersection Filtering for Leeches
- [x] **WK-019: Filter Logic Refinement** (Complete)
    - Extracted 'Leeches' from the general Scope Array (`wklbgh_focus_settings`).
    - Created a standalone boolean modifier `wklbgh_leeches_only`.
    - Updated `filterItems` in `logic.ts` to use an AND intersection: first items are gathered based on OR rules (All, 1-10, Recent), and THEN if `leechesOnly` is true, the result is further filtered down to only include leeches.
    - Added clear helper text in the UI explaining that this setting restricts other active selections.
    - Added specific unit tests to verify the intersection behavior.

### Retrospective:
- **UX Design over purely Logical Code:** While we initially designed filtering to be purely logical (additive OR vs intersection AND), shifting the *UI* to represent Leeches as a boolean modifier decoupled from scope completely resolved a major UX trap.


## 2026-03-07: Sprint 15 Completion (v0.5.0) - Short Story Generation

### Feature: Short Story Generation
- [x] **WK-025: Short Story Generation** (Complete)
    - Added a "Generate Short Story" button beneath the Grammar Lesson button.
    - Created a new `buildShortStoryPrompt` that requests a 10-sentence story and 5 reading comprehension questions using only known vocabulary.
    - Unified JLPT grammar level ceiling logic to dynamically constrain both vocabulary and grammar allowance.
    - Ensured multiple choice explanations generated by the LLM are exclusively in English.
    - Updated `App.tsx` and UI states to elegantly display the short story with the translation optionally revealed after the final question.

### Retrospective:
- **Prompt Isolation vs Unification:** When applying logic to generative prompts (like JLPT boundaries), separating vocabulary and grammatical allowances into different logical lists within the prompt creates contradictions for the LLM. Merging the boundaries into a single rule (`VOCABULARY & GRAMMAR LIMITATION`) provides better constraints.
- **Progressive Disclosure UX:** Exposing the English translation of a reading comprehension text at the beginning trivializes the task. Hiding the translation until the last question creates a more challenging and rewarding experience.

## 2026-03-07: Sprint 16 Completion (v1.0.0) - Interactive Lesson Review

### Feature: Interactive Lesson Review
- [x] **WK-027: Interactive Lesson Review** (Complete)
    - Implemented a post-lesson review accordion in the results screen.
    - Added color-coded buttons (Green/Correct, Red/Incorrect, Grey/Skipped) for each question to quickly convey performance.
    - Engineered state management (`expandedQuestions`) to allow multiple questions to be toggled open simultaneously.
    - Displayed the user's selected answer, the correct answer, and their respective explanations within the expanded view.
    - Included the short story text directly within the review section for full context during reading comprehension reviews.

### Retrospective:
- **Learning Reinforcement:** Transitioning from static numbers to an interactive review significantly increases the educational value of the widget, transforming it from a simple testing tool into a comprehensive learning aid.
