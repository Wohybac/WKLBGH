# Technical Documentation - WKLBGH

## 1. Project Overview
**WKLBGH (WaniKani Lesson Based Grammar Helper)** is a Greasyfork userscript designed to provide personalized Japanese grammar exercises. It uses the student's WaniKani progress to identify "learned" items and employs Google's Gemini AI to generate contextually relevant grammar practice.

## 2. Technical Stack
- **Framework:** React 19 (Loaded via CDN)
- **Language:** TypeScript (Strict Mode)
- **Build Tool:** Vite + `vite-plugin-monkey`
- **APIs:** WaniKani API v2, Google Gemini API (v1beta)
- **Storage:** Greasemonkey / Tampermonkey `GM_setValue` and `GM_getValue`
- **Injection Mode:** Sibling DOM (Shadow DOM removed in v0.0.1; Sibling strategy implemented in v0.0.2 for React-compatibility).

## 3. System Architecture

### 3.1 Injection & Entry Point (v0.0.2 "Sibling" Update)
To prevent WaniKani's internal React engine from unmounting our UI, the script injects the `#wklbgh-container` as a **sibling** to the `.dashboard` or `.dashboard__content` containers.
- **File:** `src/main.tsx`
- **Logic:** Listens for `turbo:load` and `turbo:render` events. Uses a 1-second `setInterval` heartbeat as a secondary safety to ensure the panel persists during dynamic WaniKani state changes.
- **Bundling:** React 19 is bundled within the script (v0.0.2+) to bypass WaniKani's Content Security Policy (CSP) which may block external CDN `@require` calls.

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
