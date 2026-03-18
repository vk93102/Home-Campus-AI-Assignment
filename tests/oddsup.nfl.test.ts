/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  OddsUp.io  ·  NFL Markets  ·  API Service Layer Test Suite     ║
 * ║  Tests auth token management, HTTP contracts, error handling     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Sport context : NFL (playbook = API; plays = endpoints)
 *
 * These are pure unit tests — no React rendering required.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need the real module, NOT a mock, for API contract tests
import { api, setAuthToken, getAuthToken } from '../src/lib/api';

const BASE = 'https://take-ai-campus-3.onrender.com';

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Build a fake Response object that fetch returns */
function fakeResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 400,
    json: async () => body,
  } as unknown as Response;
}

// ── Suite ────────────────────────────────────────────────────────────────────
describe('OddsUp NFL — API Service Suite', () => {
  beforeEach(() => {
    // global.fetch is already a vi.fn() thanks to tests/setup.ts
    localStorage.clear();
    setAuthToken(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════
  // Token Management — the "playbook"
  // ════════════════════════════════════════════════════════════════════════
  describe('Token Management (playbook)', () => {
    it('stores a token in localStorage with setAuthToken', () => {
      setAuthToken('nfl-season-pass-xyz');

      expect(localStorage.getItem('authToken')).toBe('nfl-season-pass-xyz');
      expect(getAuthToken()).toBe('nfl-season-pass-xyz');
    });

    it('removes the token from localStorage when null is passed', () => {
      setAuthToken('temp-token');
      setAuthToken(null);

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(getAuthToken()).toBeNull();
    });

    it('overwrites an existing token with a new one', () => {
      setAuthToken('old-token');
      setAuthToken('new-championship-token');

      expect(getAuthToken()).toBe('new-championship-token');
    });

    it('returns null when no token has been set', () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Authentication — "first-down plays"
  // ════════════════════════════════════════════════════════════════════════
  describe('Authentication — first-down plays', () => {
    it('POST /auth/login sends correct JSON body and headers', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ token: 'td-token-42' }),
      );

      await api.auth.login('mahomes', 'KC2024!');

      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'mahomes', password: 'KC2024!' }),
      });
    });

    it('stores the returned JWT after successful login', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ token: 'super-bowl-token' }),
      );

      await api.auth.login('lamar', 'MVPx3!');

      expect(getAuthToken()).toBe('super-bowl-token');
    });

    it('returns the full response payload on login', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ token: 'payload-token', user: 'burrow' }),
      );

      const result = await api.auth.login('burrow', 'Bengals!');

      expect(result).toEqual({ token: 'payload-token', user: 'burrow' });
    });

    it('throws the server error message on failed login', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ message: 'Invalid credentials' }, false),
      );

      await expect(api.auth.login('faker', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('throws a fallback message when server returns no message field', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({}, false),
      );

      await expect(api.auth.login('nobody', 'nothing')).rejects.toThrow(
        'Request failed',
      );
    });

    it('POST /auth/signup sends correct JSON body', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ message: 'User created successfully' }),
      );

      await api.auth.signup('draftpick2024', 'Rookie!23');

      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'draftpick2024', password: 'Rookie!23' }),
      });
    });

    it('clears the stored token when api.auth.logout is called', () => {
      setAuthToken('active-season-token');
      api.auth.logout();

      expect(getAuthToken()).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Students API — "roster management"
  // ════════════════════════════════════════════════════════════════════════
  describe('Students API — roster management', () => {
    const BEARER = 'test-nfl-bearer';

    beforeEach(() => {
      setAuthToken(BEARER);
    });

    // ── GET /api/students ────────────────────────────────────────────────

    it('GET /api/students uses default page=1 & limit=10', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse([{ id: '1', name: 'Tom Brady' }]),
      );

      await api.students.getAll();

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/api/students?page=1&limit=10`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${BEARER}` },
        }),
      );
    });

    it('appends status filter to query string', async () => {
      vi.mocked(global.fetch).mockResolvedValue(fakeResponse([]));

      await api.students.getAll(1, 10, { status: 'active' });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/api/students?page=1&limit=10&status=active`,
        expect.any(Object),
      );
    });

    it('appends search filter to query string', async () => {
      vi.mocked(global.fetch).mockResolvedValue(fakeResponse([]));

      await api.students.getAll(2, 5, { search: 'Patrick' });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/api/students?page=2&limit=5&search=Patrick`,
        expect.any(Object),
      );
    });

    it('appends both status and search when both are provided', async () => {
      vi.mocked(global.fetch).mockResolvedValue(fakeResponse([]));

      await api.students.getAll(1, 10, { status: 'active', search: 'Josh' });

      const [url] = vi.mocked(global.fetch).mock.calls[0] as [string, ...unknown[]];
      expect(url).toContain('status=active');
      expect(url).toContain('search=Josh');
    });

    // ── GET /api/students/:id ────────────────────────────────────────────

    it('GET /api/students/:id sends Authorization header', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ id: '17', name: 'Josh Allen' }),
      );

      const student = await api.students.getById('17');

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/api/students/17`,
        { headers: { Authorization: `Bearer ${BEARER}` } },
      );
      expect(student.id).toBe('17');
    });

    it('throws error when GET /api/students/:id returns 404', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ message: 'Student not found' }, false),
      );

      await expect(api.students.getById('999')).rejects.toThrow(
        'Student not found',
      );
    });

    // ── POST /api/students ───────────────────────────────────────────────

    it('POST /api/students sends the full student payload', async () => {
      const newStudent = {
        name: 'Jalen Hurts',
        status: 'active',
        isScholarship: true,
        attendancePercentage: 98,
        assignmentScore: 95,
      };

      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ id: '99', ...newStudent }),
      );

      const result = await api.students.create(newStudent);

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/api/students`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${BEARER}`,
          }),
          body: JSON.stringify(newStudent),
        }),
      );
      expect(result.id).toBe('99');
    });

    // ── PUT /api/students/:id ────────────────────────────────────────────

    it('PUT /api/students/:id sends the partial update payload', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ id: '4', name: 'Dak Prescott', status: 'graduated' }),
      );

      await api.students.update('4', { name: 'Dak Prescott', status: 'graduated' });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/api/students/4`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${BEARER}`,
          }),
          body: JSON.stringify({ name: 'Dak Prescott', status: 'graduated' }),
        }),
      );
    });

    // ── DELETE /api/students/:id ─────────────────────────────────────────

    it('DELETE /api/students/:id sends Authorization header', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ message: 'Deleted' }),
      );

      await api.students.delete('88');

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/api/students/88`,
        expect.objectContaining({
          method: 'DELETE',
          headers: { Authorization: `Bearer ${BEARER}` },
        }),
      );
    });

    it('throws error when DELETE returns a non-ok response', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        fakeResponse({ error: 'Forbidden' }, false),
      );

      await expect(api.students.delete('1')).rejects.toThrow('Forbidden');
    });
  });
});
