import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Tampermonkey / Greasemonkey APIs
global.GM_getValue = vi.fn((key, defaultValue) => defaultValue);
global.GM_setValue = vi.fn();
global.GM_addStyle = vi.fn();
global.GM_xmlhttpRequest = vi.fn();

// Mock unsafeWindow for WKOF detection
global.unsafeWindow = {
  wkof: undefined,
} as any;

// Mock MutationObserver
global.MutationObserver = class {
  observe() {}
  disconnect() {}
  takeRecords() { return []; }
};
