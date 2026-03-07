# Technical Documentation - WKU (WaniKani Ushi)

## 1. Project Overview
**WKU (WaniKani Ushi)** is a Greasyfork userscript designed to provide personalized Japanese grammar exercises. It uses the student's WaniKani progress (Kanji and Vocabulary) to feed the Gemini 1.5 Flash API, ensuring that all generated exercises use only familiar vocabulary.

## 2. Technical Stack
- **Framework:** React 19 (Bundled for CSP compliance).
- **Build Tool:** Vite + `vite-plugin-monkey`.
- **Data Source:** WaniKani API v2 via **WaniKani Open Framework (WKOF)**.
- **AI Engine:** Google Gemini 1.5 Flash.
- **Styling:** Vanilla CSS, heavily namespaced (`.wklbgh-`) to prevent leaking.

## 3. Architecture & Features

### 3.1 Injection Strategy (Virtual Widget)
To ensure compatibility with WaniKani's modular dashboard (introduced Oct 2025), WKU uses a **MutationObserver** to detect the presence of the dashboard container (`.dashboard__content`).
- **Native Alignment:** The widget mirrors native layout structures but uses completely isolated CSS classes (e.g., `.wklbgh-widget-layout`) to prevent overriding WaniKani's own dashboard elements.
- **Dynamic Placement:** Users can select their preferred injection point via settings:
    - **Top:** Injected at the start of the dashboard.
    - **Below Level Progress:** Injected after the level progress widget (Primary target).
    - **Bottom:** Injected at the end of the dashboard content.

### 3.2 State & Data Management
The application state is managed within the root `App.tsx` component using React `useState`. 
- **API Keys:** Stored in the browser's userscript storage (`GM_setValue`).
- **Global Stats:** Persistent tracking of correct, incorrect, and skipped answers, along with lesson timestamps, tied directly to the user's API key (`wklbgh_stats_${apiKey}`).
- **Active Gemini Model:** Persisted model identifier resulting from the auto-discovery process (`wklbgh_active_model`).
- **Focus Settings:** Persisted array of selected scopes (e.g., `['1-10', 'recent']`).
- **Leeches Modifier:** Persisted boolean (`wklbgh_leeches_only`) that acts as an intersection filter on the main focus settings.
- **JLPT Settings:** Persisted array of selected JLPT levels for generation constraints (`wklbgh_jlpt_settings`).
- **Placement Settings:** Persisted preference for where the widget appears.
- **Learned Items:** Fetched via WKOF, filtered by SRS stage (1-9) and user selection.

### 3.3 Data Filtering Logic
1.  **Scope Selection (OR Logic):** Gathers items matching any selected scope:
    - **Level Spreads:** Filters items by user-selected ranges (e.g., 1-10, 11-20). 
    - **Most Recent:** Dynamically filters items from levels `[user_level, user_level-1, user_level-2]`.
    - **All:** Bypasses scope restrictions.
2.  **Leech Modifier (AND Logic):** If the "Restrict to Leeches Only" setting is true, the gathered scope is intersected to only include items matching the leech formula: `incorrect_answers / (srs_stage ^ 1.5)`. Includes burned items with high historical failure rates.

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