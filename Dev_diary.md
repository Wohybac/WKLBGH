# Development Diary

## 2026-02-28: Sprint 1 - Project Scaffolding & Hello World

### Goals:
- [x] Initial GitHub repository connection.
- [x] Project initialization with Vite + React + TypeScript and `vite-plugin-monkey`.
- [x] Injecting a basic "Hello World" UI into WaniKani.

### Results:
- [x] Connected local Git to GitHub (`Wohybac/WKLBGH`).
- [x] Project initialized in `wanikani-lesson-manager` with Vite, React, and TypeScript.
- [x] Configured `vite-plugin-monkey` for `match: ['https://www.wanikani.com/*']`.
- [x] Implemented Shadow DOM in `main.tsx` for style isolation.
- [x] Created "Hello World" UI in `App.tsx` with the full project name: "WKLBGH - WaniKani Lesson Based Grammar Helper".
- [x] Successfully built the userscript into `dist/`.

### Retrospective (Planned):
- The initialization was smooth using `create-monkey`. 
- The decision to use Shadow DOM for style isolation is a solid foundation.
- Need to ensure future components use styles that work well inside the Shadow DOM (e.g., inlining CSS or using CSS-in-JS).
