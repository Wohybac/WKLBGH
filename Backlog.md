# Project Backlog

## Completed Tasks
- [x] **WK-001: Project Initialization** - Initialize Vite + React + TS with `vite-plugin-monkey`.
- [x] **WK-002: Basic UI Injection** - Inject a simple panel into the WaniKani dashboard.
- [x] **WK-004: Repository Setup** - Finalize the folder structure and initial Git commit.
- [x] **WK-005: WaniKani API Connection** - Integrate WaniKani API to fetch learned progress.
- [x] **WK-006: Gemini API Integration** - Connect to Gemini for personalized lesson generation.
- [x] **WK-007: UI Design & Lesson Manager** - Build the core React components for settings and lesson display.
- [x] **WK-008.1: Visual Verification** - Achieve unmissable visual delivery on the WaniKani dashboard.
- [x] **WK-009: WKOF Integration** - Integrate WaniKani Open Framework for high-performance subject caching.
- [x] **WK-013.1: CSS Theme Alignment** - Cleaned up global CSS to prevent black background issues.
- [x] **WK-010: Advanced Focus Selection** - Implement the Focus Matrix in settings (v0.2.0).
- [x] **WK-016: Bugfix - WKOF Detection** - Fixed detection issue using `unsafeWindow` and `document-start` (v0.2.1).
- [x] **WK-018: Bugfix - WKOF Scan Hang** - Fixed by removing `@require` conflict and using `review_statistics` (v0.2.8).
- [x] **WK-011: Testing Suite** - Set up Vitest and write initial unit tests for data filtering and state logic.
- [x] **WK-017: Bugfix - UI Layout & Scoping** - Implemented Virtual Widget system with MutationObserver and user-selectable placement (v0.2.13).
- [x] **WK-020: Gemini Integration Fix** - Ensure Gemini API integration is functional and receiving simple responses.
- [x] **WK-021: Prompt Engineering** - Design and iterate on the prompt for generating personalized lessons based on focused data.
- [x] **WK-022: Lesson UI/UX Flow** - Design and implement the user flow for interacting with the generated lessons.
- [x] **WK-013: UI Refinement & Rebranding** - Beautify the panel into a native WaniKani-looking widget with WKU (Ushi) rebranding (v0.2.17).
- [x] **WK-023: JLPT Difficulty Settings** - Add JLPT level options (N5-N1) to the settings menu for tailored lesson generation.
- [x] **WK-024: Difficulty-Aware Prompting** - Update Gemini prompts to incorporate the user-selected JLPT difficulty level.
- [x] **WK-015: Settings Menu Restructuring** - (REMOVED) Organize settings into sub-menus or tabs for better UX.
- [x] **WK-026: Global User Statistics** - Track and store cumulative lesson stats (correct, incorrect, skipped) across all sessions (v0.4.0).
- [x] **WK-019: Filter Logic Refinement** - Transitioned Leeches from additive (OR) to an intersection-based (AND) modifier for multiple focus areas (v0.4.1).
- [x] **WK-028: Prompt Safeguards & Narrative Flow** - Added strict prompt instructions against multiple correct options and updated short story prompt to require a cohesive narrative (v1.1.0).

## To-Do Tasks (Ordered by Priority)

### High Priority
- [x] **WK-027: Interactive Lesson Review** - Add an expandable review section to the results screen, showing individual questions, the user's answer, the correct answer, and their respective explanations.

### Medium Priority

### Low Priority
- [x] **WK-025: Short Story Generation** - Add an option to generate a short story using familiar vocabulary instead of a standard grammar lesson.