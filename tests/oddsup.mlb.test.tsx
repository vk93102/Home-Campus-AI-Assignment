/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  OddsUp.io  ·  MLB Markets  ·  Platform Infrastructure Suite    ║
 * ║  Covers: utils · Loader · NotFound · Index (auth-gate) ·        ║
 * ║          Dashboard extended (edit / add / delete flows)          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Sport context : MLB (nine-inning structure → nine test groups)
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// ── API module mock ──────────────────────────────────────────────────────────
vi.mock('../src/lib/api', () => ({
  api: {
    auth: {
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    },
    students: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn(),
}));

import { api, getAuthToken } from '../src/lib/api';
import { cn } from '../src/lib/utils';
import Loader from '../src/components/Loader';
import NotFound from '../src/pages/NotFound';
import Index from '../src/pages/Index';
import Dashboard from '../src/components/Dashboard';

// ── Shared MLB roster fixture ────────────────────────────────────────────────
const MLB_ROSTER = [
  {
    id: '42',
    name: 'Jackie Robinson',
    status: 'active',
    is_scholarship: 1,
    attendance_percentage: 97,
    assignment_score: 92,
    grade_point_average: 94.5,
  },
  {
    id: '7',
    name: 'Mickey Mantle',
    status: 'active',
    is_scholarship: 0,
    attendance_percentage: 85,
    assignment_score: 80,
    grade_point_average: 82.5,
  },
  {
    id: '24',
    name: 'Willie Mays',
    status: 'graduated',
    is_scholarship: 1,
    attendance_percentage: 72,
    assignment_score: 69,
    grade_point_average: 70.5,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// 1st Inning — Utility Function Suite (cn)
// ══════════════════════════════════════════════════════════════════════════════
describe('OddsUp MLB — Utility Function Suite (cn)', () => {
  it('merges multiple class names into a single string', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values (false, undefined, null)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(cn('foo', false as any, undefined, 'baz')).toBe('foo baz');
  });

  it('resolves tailwind conflicts — last class wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('returns an empty string when called with no arguments', () => {
    expect(cn()).toBe('');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2nd Inning — Loader Component Suite
// ══════════════════════════════════════════════════════════════════════════════
describe('OddsUp MLB — Loader Component Suite', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows "Initializing Student Portal" text on mount', () => {
    render(<Loader />);
    expect(screen.getByText('Initializing Student Portal')).toBeInTheDocument();
  });

  it('starts at 0% progress on initial render', () => {
    render(<Loader />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('advances past 0% after 500 ms of setInterval ticks', async () => {
    vi.useFakeTimers();
    render(<Loader />);
    // 500ms / 30ms interval = ~16 ticks × 2% each = ~32%
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('caps progress at 100% after all intervals have fired', async () => {
    vi.useFakeTimers();
    render(<Loader />);
    // 50 ticks × 2% = 100%; advance well past that
    await act(async () => {
      vi.advanceTimersByTime(3500);
    });
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

describe('OddsUp MLB — NotFound Page Suite', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders the 404 heading', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('shows the "Oops! Page not found" message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
  });

  it('has a "Return to Home" link pointing to "/"', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /return to home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('logs a 404 console error with the attempted pathname', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-page']}>
        <NotFound />
      </MemoryRouter>,
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('404'),
      '/unknown-page',
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4th Inning — Index Page (Auth Gate) Suite
// ══════════════════════════════════════════════════════════════════════════════
describe('OddsUp MLB — Index Page (auth gate)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.students.getAll).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the Loader immediately on initial render', () => {
    vi.mocked(getAuthToken).mockReturnValue(null);
    render(<Index />);
    expect(screen.getByText('Initializing Student Portal')).toBeInTheDocument();
  });

  it('shows Auth page after 2500 ms when no token is stored', async () => {
    vi.mocked(getAuthToken).mockReturnValue(null);
    vi.useFakeTimers();
    render(<Index />);
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('shows Dashboard after 2500 ms when a valid token is stored', async () => {
    vi.mocked(getAuthToken).mockReturnValue('valid-stored-token');
    vi.useFakeTimers();
    render(<Index />);
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    vi.useRealTimers();
    expect(screen.getByText('AI Campus Portal')).toBeInTheDocument();
  });

  it('transitions to Dashboard after a successful login on the Auth page', async () => {
    vi.mocked(getAuthToken).mockReturnValue(null);
    vi.mocked(api.auth.login).mockResolvedValue({ token: 'fresh-token' });
    vi.useFakeTimers();
    render(<Index />);
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    vi.useRealTimers();

    // Index now renders Auth
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/username/i), 'mlbfan');
    await user.type(screen.getByLabelText(/password/i), 'WorldSeries!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('AI Campus Portal')).toBeInTheDocument();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5th Inning — Dashboard Extended Coverage Suite
// edit · add · delete-confirm · delete-cancel · delete-error flows
// ══════════════════════════════════════════════════════════════════════════════
describe('OddsUp MLB — Dashboard Extended Coverage Suite', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.students.getAll).mockResolvedValue(MLB_ROSTER);
    vi.mocked(api.students.create).mockResolvedValue({ id: '99', name: 'Babe Ruth' });
    vi.mocked(api.students.update).mockResolvedValue({
      id: '42',
      name: 'Jackie Robinson',
    });
    vi.mocked(api.students.delete).mockResolvedValue({ message: 'Deleted' });
  });

  // ── Edit flow ──────────────────────────────────────────────────────────────

  it('opens the Edit Student modal with pre-populated student data', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Jackie Robinson');

    // Button layout per Dashboard: [0]=Logout [1]=AddStudent
    //   then per row: [2n]=Edit [2n+1]=Delete  (n=row index, 0-based, offset 1)
    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[2]); // Edit — Jackie Robinson (row 1)

    expect(screen.getByText('Edit Student')).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText(
      'Enter student name',
    ) as HTMLInputElement;
    expect(nameInput.value).toBe('Jackie Robinson');
  });

  it('calls api.students.update with the student id when the edit form is submitted', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Jackie Robinson');

    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[2]); // Edit — Jackie Robinson
    await screen.findByText('Edit Student');

    // Submit without changing data
    await user.click(screen.getByRole('button', { name: /update student/i }));

    await waitFor(() => {
      expect(api.students.update).toHaveBeenCalledWith(
        '42',
        expect.objectContaining({ name: 'Jackie Robinson' }),
      );
    });
  });

  it('closes the edit modal after a successful update', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Jackie Robinson');

    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[2]); // Edit
    await screen.findByText('Edit Student');

    await user.click(screen.getByRole('button', { name: /update student/i }));

    await waitFor(() => {
      expect(screen.queryByText('Edit Student')).not.toBeInTheDocument();
    });
  });

  // ── Add flow ───────────────────────────────────────────────────────────────

  it('calls api.students.create when the Add Student form is submitted', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);

    await user.click(await screen.findByRole('button', { name: /add student/i }));
    await screen.findByText('Add New Student');

    const nameInput = screen.getByPlaceholderText('Enter student name');
    // Type the name and submit via Enter key (avoids ambiguous 'Add Student' button)
    await user.type(nameInput, 'Babe Ruth{Enter}');

    await waitFor(() => {
      expect(api.students.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Babe Ruth' }),
      );
    });
  });

  it('closes the add modal after a successful create', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);

    await user.click(await screen.findByRole('button', { name: /add student/i }));
    await screen.findByText('Add New Student');

    const nameInput = screen.getByPlaceholderText('Enter student name');
    await user.type(nameInput, 'Cy Young{Enter}');

    await waitFor(() => {
      expect(screen.queryByText('Add New Student')).not.toBeInTheDocument();
    });
  });

  // ── Delete-confirm flow ────────────────────────────────────────────────────

  it('calls api.students.delete with the correct id when deletion is confirmed', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Jackie Robinson');

    // [3] = Delete button for Jackie Robinson (row 1)
    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[3]);
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();

    // Click the "Delete" button in the confirmation dialog
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(api.students.delete).toHaveBeenCalledWith('42');
    });
  });

  it('closes the confirm dialog after successful deletion', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Jackie Robinson');

    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[3]);
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
  });

  it('refetches students after a successful deletion', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Jackie Robinson');

    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[3]);
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      // getAll called once on mount + once after delete = at least 2 times
      expect(api.students.getAll).toHaveBeenCalledTimes(2);
    });
  });

  // ── Delete-cancel flow ────────────────────────────────────────────────────

  it('closes the confirm dialog without deleting when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Jackie Robinson');

    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[3]);
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    expect(api.students.delete).not.toHaveBeenCalled();
  });

  // ── Delete-error flow ─────────────────────────────────────────────────────

  it('shows an error banner when delete fails', async () => {
    vi.mocked(api.students.delete).mockRejectedValue(
      new Error('Delete forbidden'),
    );
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Jackie Robinson');

    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[3]);
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.getByText('Delete forbidden')).toBeInTheDocument();
    });
  });
});
