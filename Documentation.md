# Technical Documentation - WKLBGH

## 1. Project Overview
**WKLBGH (WaniKani Lesson Based Grammar Helper)** is a Greasyfork userscript designed to provide personalized Japanese grammar exercises. It uses the student's WaniKani progress to identify "learned" items and employs Google's Gemini AI to generate contextually relevant grammar practice.

## 2. Technical Stack
- **Framework:** React 19 (Loaded via CDN)
- **Language:** TypeScript (Strict Mode)
- **Build Tool:** Vite + `vite-plugin-monkey`
- **APIs:** WaniKani API v2, Google Gemini API (v1beta)
- **Storage:** Greasemonkey / Tampermonkey `GM_setValue` and `GM_getValue`
- **Injection Mode:** Standard DOM (Shadow DOM removed in v0.0.1 for visibility troubleshooting). 

## 3. System Architecture

### 3.1 Injection & Entry Point (v0.0.1 Update)
The script targets the WaniKani dashboard widget system. It specifically looks for the Level Progress widget using `[data-widget-name="level_progress"]`.
- **File:** `src/main.tsx`
- **Logic:** Uses a `MutationObserver` and `turbo:load` event listener. 
- **Placement:** The panel is injected immediately **after** the Level Progress widget container as a standard `div` element (`#wklbgh-container`).
- **Aggressive Visibility:** The container uses `!important` CSS rules (yellow border, fixed min-height) to ensure it is rendered and visible regardless of host site styles.

### 3.2 State & Data Management
The application state is managed within the root `App.tsx` component using React `useState`. 
- **API Keys:** Stored in the browser's userscript storage (`GM_setValue`).
- **User Progress:** Fetched from WaniKani's `/assignments` endpoint.
- **Learned Items:** Defined as assignments where `srs_stage > 0` and `started = true`.

### 3.3 External Integrations
- **WaniKani API:** All requests include the `Wanikani-Revision: 20170710` header.
- **Gemini API:** Uses the `generateContent` endpoint. Prompts are constructed using the user's level and learned item counts.
- **CORS Handling:** All API communication uses `GM_xmlhttpRequest` to bypass browser security restrictions.

## 4. Build & Distribution
- **Externalization:** React and ReactDOM are **fully** externalized. The `vite.config.ts` uses `jsxRuntime: 'classic'` and aliases for `react/jsx-runtime` to ensure zero React code is bundled.
- **File Size:** Optimized to ~11 KB.
- **Output:** A single, transparent `.user.js` file in the `dist/` directory.
- **Compliance:** Minification is disabled for Greasyfork transparency.

## 5. Security Standards
- **Key Storage:** API keys are stored only in the user's local userscript storage via `GM_setValue`.
- **Communication:** All API calls are made over encrypted HTTPS.
