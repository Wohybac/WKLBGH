# Technical Documentation - WKLBGH

## 1. Project Overview
**WKLBGH (WaniKani Lesson Based Grammar Helper)** is a Greasyfork userscript designed to provide personalized Japanese grammar exercises. It uses the student's WaniKani progress (Kanji and Vocabulary) to feed the Gemini 1.5 Flash API, ensuring that all generated exercises use only familiar vocabulary.

## 2. Technical Stack
- **Framework:** React 19 (Bundled for CSP compliance).
- **Build Tool:** Vite + `vite-plugin-monkey`.
- **Data Source:** WaniKani API v2 via **WaniKani Open Framework (WKOF)**.
- **AI Engine:** Google Gemini 1.5 Flash.
- **Styling:** Vanilla CSS + Native WaniKani classes.

## 3. Architecture & Features

### 3.1 Injection Strategy (Virtual Widget)
To ensure compatibility with WaniKani's modular dashboard (introduced Oct 2025), WKLBGH uses a **MutationObserver** to detect the presence of the dashboard container (`.dashboard__content`).
- **Native Alignment:** The widget is wrapped in standard WaniKani classes (`.dashboard__row`, `.dashboard__widget`) to maintain layout integrity.
- **Dynamic Placement:** Users can select their preferred injection point via settings:
    - **Top:** Injected at the start of the dashboard.
    - **Below Level Progress:** Injected after the level progress widget (Primary target).
    - **Bottom:** Injected at the end of the dashboard content.

### 3.2 State & Data Management
The application state is managed within the root `App.tsx` component using React `useState`. 
- **API Keys:** Stored in the browser's userscript storage (`GM_setValue`).
- **Active Gemini Model:** Persisted model identifier resulting from the auto-discovery process (`wklbgh_active_model`).
- **Focus Settings:** Persisted array of selected filters (e.g., `['1-10', 'recent']`).
- **Placement Settings:** Persisted preference for where the widget appears.
- **Learned Items:** Fetched via WKOF, filtered by SRS stage (1-9) and user selection.

### 3.3 Data Filtering Logic
1.  **Level Spreads:** Filters items by user-selected ranges (e.g., 1-10, 11-20). 
2.  **Most Recent:** Dynamically filters items from levels `[user_level, user_level-1, user_level-2]`.
3.  **Leeches:** Identifies items using the formula: `incorrect_answers / (srs_stage ^ 1.5)`. Includes burned items with high historical failure rates.

### 3.4 Gemini Auto-Discovery & Interaction
To ensure broad compatibility with varying API keys and model availability, the application employs a self-healing auto-discovery mechanism:
1.  **List Models:** Fetches available models from `https://generativelanguage.googleapis.com/v1/models`.
2.  **Filter & Prioritize:** Filters for models supporting `generateContent` and prioritizes `gemini-1.5-flash`, `gemini-1.5-flash-latest`, and `gemini-pro`.
3.  **Test & Persist:** Sends a lightweight "ping" prompt to the prioritized model. Upon success, the model ID is saved to userscript storage (`GM_setValue`) and used directly for future requests, bypassing discovery.

### 3.5 Security & Performance
- **Sandbox Compatibility:** Uses `unsafeWindow` to bridge the gap between the userscript sandbox and WaniKani's global `wkof` object.
- **CSP Compliance:** React is bundled to bypass strict Content Security Policies.
- **Prompt Optimization:** Samples up to 50 items from the filtered set to keep AI token usage efficient.

## 4. Testing
- **Framework:** Vitest + JSDOM.
- **Commands:** `npm run test` to run tests in watch mode; `npm run test -- --run` for a single execution.
- **Structure:**
    - `src/tests/setupTests.ts`: Global mocks for Tampermonkey APIs and `wkof`.
    - `src/logic.ts`: Decoupled business logic (Filtering, Leech detection).
    - `src/tests/logic.test.ts`: Unit tests for core logic.

## 5. Developer Guide
- **Build:** `npm run build` generates the `.user.js` in `/dist`.
- **Version Sync:** Version numbers must be synchronized across `package.json`, `vite.config.ts`, and the console log in `main.tsx`.