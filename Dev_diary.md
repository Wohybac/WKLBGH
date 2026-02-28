# Development Diary

## 2026-02-28: Sprint 2 - Core API & Gemini Integration

### Goals:
- [x] Enable WaniKani API Key authentication and persistent storage.
- [x] Fetch learned Kanji and Vocabulary counts from WaniKani.
- [x] Connect to Gemini API to generate personalized Japanese lessons.
- [x] Finalize UI with settings toggle and exercise display.

### Results:
- [x] Implemented Settings UI for WaniKani and Gemini API keys.
- [x] Used `GM_setValue`/`GM_getValue` to securely store keys in the user's browser.
- [x] Developed `/assignments` scanner to identify learned items (SRS stage > 0).
- [x] Integrated Gemini API (v1beta) to generate lessons using the student's current progress.
- [x] Reduced `.user.js` size by externalizing React to a CDN.
- [x] Fixed injection timing to ensure compatibility with Tampermonkey.

### Retrospective:
- The `GM_xmlhttpRequest` was essential to bypass CORS for both WaniKani and Gemini APIs.
- Externalizing React saved significant file size and improved load times.
- **Improvement:** In future sprints, we should fetch actual Kanji/Vocab strings (via WKOF) rather than just counts to make the Gemini prompts even more accurate.
