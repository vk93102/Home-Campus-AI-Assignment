/**
 * OddsUp.io — Global Test Setup
 * Configures the JSDOM environment for all test suites
 */

import '@testing-library/jest-dom';

// ── Global fetch mock baseline ─────────────────────────────────────────────
// Individual tests override this as needed
global.fetch = vi.fn();

// ── localStorage reset between every test ─────────────────────────────────
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
