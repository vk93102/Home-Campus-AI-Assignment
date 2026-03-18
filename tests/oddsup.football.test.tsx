/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  OddsUp.io  ·  Football Markets  ·  Authentication Test Suite   ║
 * ║  Tests the Auth component — login, signup and error handling     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Naming convention mirrors OddsUp.io sport-market segments:
 *   oddsup.<sport>.test.tsx
 *
 * Sport context : Football (soccer / gridiron — all auth flows)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Auth from '../src/components/Auth';

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

// We import after the mock so vi.mocked() works correctly
import { api } from '../src/lib/api';

// ── Suite ────────────────────────────────────────────────────────────────────
describe('OddsUp Football — Authentication Suite', () => {
  const mockOnAuthSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the login form by default', () => {
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders the AI Campus Student Portal subtitle', () => {
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);
    expect(screen.getByText('AI Campus Student Portal')).toBeInTheDocument();
  });

  it('renders a "Sign up" toggle link on the login screen', () => {
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);
    expect(
      screen.getByText(/don't have an account\? sign up/i),
    ).toBeInTheDocument();
  });

  // ── Mode toggle ───────────────────────────────────────────────────────────

  it('switches to signup mode when the toggle link is clicked', async () => {
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.click(screen.getByText(/don't have an account\? sign up/i));

    expect(screen.getByText('Join Us')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('switches back to login mode after toggling twice', async () => {
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.click(screen.getByText(/don't have an account\? sign up/i));
    await user.click(screen.getByText(/already have an account\? sign in/i));

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // ── Happy paths ───────────────────────────────────────────────────────────

  it('calls api.auth.login with entered credentials on submit', async () => {
    vi.mocked(api.auth.login).mockResolvedValue({ token: 'match-day-token' });
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'footballfan');
    await user.type(screen.getByLabelText(/password/i), 'GoBirds!2024');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith('footballfan', 'GoBirds!2024');
    });
  });

  it('calls onAuthSuccess after a successful login', async () => {
    vi.mocked(api.auth.login).mockResolvedValue({ token: 'champ-token' });
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'coachbelichick');
    await user.type(screen.getByLabelText(/password/i), 'Patriots!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('calls signup then login on signup form submission', async () => {
    vi.mocked(api.auth.signup).mockResolvedValue({ message: 'created' });
    vi.mocked(api.auth.login).mockResolvedValue({ token: 'draft-pick-token' });
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.click(screen.getByText(/don't have an account\? sign up/i));
    await user.type(screen.getByLabelText(/username/i), 'rookiequarterback');
    await user.type(screen.getByLabelText(/password/i), 'Touchdown99!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.auth.signup).toHaveBeenCalledWith(
        'rookiequarterback',
        'Touchdown99!',
      );
      expect(api.auth.login).toHaveBeenCalledWith(
        'rookiequarterback',
        'Touchdown99!',
      );
      expect(mockOnAuthSuccess).toHaveBeenCalled();
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  it('displays an error message when login fails', async () => {
    vi.mocked(api.auth.login).mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'wronguser');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('does not call onAuthSuccess when login fails', async () => {
    vi.mocked(api.auth.login).mockRejectedValue(new Error('Unauthorized'));
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'badactor');
    await user.type(screen.getByLabelText(/password/i), 'hack');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });
    expect(mockOnAuthSuccess).not.toHaveBeenCalled();
  });

  it('clears the error message when toggling between login and signup', async () => {
    vi.mocked(api.auth.login).mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'user');
    await user.type(screen.getByLabelText(/password/i), 'pass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText('Server error')).toBeInTheDocument(),
    );

    await user.click(screen.getByText(/don't have an account\? sign up/i));
    expect(screen.queryByText('Server error')).not.toBeInTheDocument();
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  it('shows the "Processing…" spinner while the API call is pending', async () => {
    // A promise that never resolves keeps the component in loading state
    vi.mocked(api.auth.login).mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'waitinguser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText('Processing...')).toBeInTheDocument(),
    );
  });

  it('disables the submit button while loading', async () => {
    vi.mocked(api.auth.login).mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'spinner');
    await user.type(screen.getByLabelText(/password/i), 'loading!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const btn = screen.getByText('Processing...').closest('button');
      expect(btn).toBeDisabled();
    });
  });
});
