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

## To-Do Tasks (Ordered by Priority)

### High Priority
- [x] **WK-020: Gemini Integration Fix** - Ensure Gemini API integration is functional and receiving simple responses.
- [ ] **WK-021: Prompt Engineering** - Design and iterate on the prompt for generating personalized lessons based on focused data.
- [ ] **WK-022: Lesson UI/UX Flow** - Design and implement the user flow for interacting with the generated lessons. (Dependent on WK-021)

### Medium Priority
- [ ] **WK-023: JLPT Difficulty Settings** - Add JLPT level options (N5-N1) to the settings menu for tailored lesson generation.
- [ ] **WK-024: Difficulty-Aware Prompting** - Update Gemini prompts to incorporate the user-selected JLPT difficulty level.
- [ ] **WK-019: Filter Logic Refinement** - Transition from additive (OR) to intersection-based (AND) filtering when multiple focus areas are selected.
- [ ] **WK-015: Settings Menu Restructuring** - Organize settings into sub-menus or tabs for better UX.
- [ ] **WK-013: UI Refinement** - Beautify the panel into a native WaniKani-looking widget.

### Low Priority
- [ ] **WK-025: Short Story Generation** - Add an option to generate a short story using familiar vocabulary instead of a standard grammar lesson.