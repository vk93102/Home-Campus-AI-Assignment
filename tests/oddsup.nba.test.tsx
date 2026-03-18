/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  OddsUp.io  ·  NBA Markets  ·  Student Dashboard Test Suite     ║
 * ║  Tests Dashboard component + StudentModal end-to-end flows       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Sport context : NBA (player-roster analogy → student roster/CRUD)
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../src/components/Dashboard';
import StudentModal from '../src/components/StudentModal';

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

import { api } from '../src/lib/api';

// ── Fixtures (NBA-flavoured names for fun, tests the real component) ─────────
const NBA_ROSTER = [
  {
    id: '23',
    name: 'LeBron James',
    status: 'active',
    is_scholarship: 1,
    attendance_percentage: 96,
    assignment_score: 90,
    grade_point_average: 93.0,
  },
  {
    id: '30',
    name: 'Stephen Curry',
    status: 'active',
    is_scholarship: 0,
    attendance_percentage: 91,
    assignment_score: 88,
    grade_point_average: 89.5,
  },
  {
    id: '35',
    name: 'Kevin Durant',
    status: 'inactive',
    is_scholarship: 1,
    attendance_percentage: 74,
    assignment_score: 72,
    grade_point_average: 73.0,
  },
];

// ── Dashboard Suite ──────────────────────────────────────────────────────────
describe('OddsUp NBA — Student Dashboard Suite', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.students.getAll).mockResolvedValue(NBA_ROSTER);
  });

  // ── Layout & navigation ───────────────────────────────────────────────────

  it('renders the AI Campus Portal navbar brand', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);
    expect(await screen.findByText('AI Campus Portal')).toBeInTheDocument();
  });

  it('renders the Logout button in the navbar', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);
    expect(
      await screen.findByRole('button', { name: /logout/i }),
    ).toBeInTheDocument();
  });

  it('calls api.auth.logout and onLogout when Logout is clicked', async () => {
    vi.mocked(api.auth.logout).mockImplementation(() => {});
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);

    await user.click(await screen.findByRole('button', { name: /logout/i }));

    expect(api.auth.logout).toHaveBeenCalledTimes(1);
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  it('shows a loading spinner while students are being fetched', () => {
    vi.mocked(api.students.getAll).mockImplementation(() => new Promise(() => {}));
    render(<Dashboard onLogout={mockOnLogout} />);
    expect(screen.getByText('Loading students...')).toBeInTheDocument();
  });

  // ── Stats cards ───────────────────────────────────────────────────────────

  it('renders the "Total Students" stat with correct count', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('LeBron James'); // wait for data

    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders the "Scholarship Students" stat with correct count', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('LeBron James');

    expect(screen.getByText('Scholarship Students')).toBeInTheDocument();
    // LeBron (is_scholarship=1) + Durant (is_scholarship=1) = 2
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders the "Avg Performance" stat', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('Avg Performance');
    expect(screen.getByText('Avg Performance')).toBeInTheDocument();
  });

  // ── Student table ─────────────────────────────────────────────────────────

  it('renders all students from the API in the table', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);

    expect(await screen.findByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
    expect(screen.getByText('Kevin Durant')).toBeInTheDocument();
  });

  it('renders correct status badges for each student', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('LeBron James');

    const activeBadges = screen.getAllByText('active');
    expect(activeBadges).toHaveLength(2); // LeBron + Curry

    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('shows the "No students found" empty state when list is empty', async () => {
    vi.mocked(api.students.getAll).mockResolvedValue([]);
    render(<Dashboard onLogout={mockOnLogout} />);
    expect(await screen.findByText('No students found')).toBeInTheDocument();
  });

  // ── Error handling ────────────────────────────────────────────────────────

  it('displays an inline error banner when the API throws', async () => {
    vi.mocked(api.students.getAll).mockRejectedValue(
      new Error('Network timeout'),
    );
    render(<Dashboard onLogout={mockOnLogout} />);
    expect(await screen.findByText('Network timeout')).toBeInTheDocument();
  });

  // ── Search ────────────────────────────────────────────────────────────────

  it('renders the search input', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('LeBron James');
    expect(
      screen.getByPlaceholderText('Search by name...'),
    ).toBeInTheDocument();
  });

  it('calls api.students.getAll with search param when user types', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('LeBron James');

    await user.type(screen.getByPlaceholderText('Search by name...'), 'LeBron');

    await waitFor(() => {
      expect(api.students.getAll).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ search: 'LeBron' }),
      );
    });
  });

  // ── Add Student modal ─────────────────────────────────────────────────────

  it('renders the "Add Student" button', async () => {
    render(<Dashboard onLogout={mockOnLogout} />);
    expect(
      await screen.findByRole('button', { name: /add student/i }),
    ).toBeInTheDocument();
  });

  it('opens the StudentModal when "Add Student" is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);

    await user.click(await screen.findByRole('button', { name: /add student/i }));

    expect(screen.getByText('Add New Student')).toBeInTheDocument();
  });

  // ── Delete confirmation ───────────────────────────────────────────────────

  it('shows a delete confirmation dialog when the trash icon is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard onLogout={mockOnLogout} />);
    await screen.findByText('LeBron James');

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    // Find first delete (Trash2) button — it comes after the edit button per row
    // The Trash2 buttons are every second icon button in each row
    const trashButtons = deleteButtons.filter((_, i) => i % 2 !== 0);
    await user.click(trashButtons[0]);

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(
      screen.getByText(
        /are you sure you want to delete this student\? this action cannot be undone\./i,
      ),
    ).toBeInTheDocument();
  });
});

// ── StudentModal Suite ───────────────────────────────────────────────────────
describe('OddsUp NBA — StudentModal Suite', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Add New Student" title when no student prop is passed', () => {
    render(
      <StudentModal onClose={mockOnClose} onSave={mockOnSave} />,
    );
    expect(screen.getByText('Add New Student')).toBeInTheDocument();
  });

  it('renders "Edit Student" title when an existing student is provided', () => {
    render(
      <StudentModal
        student={NBA_ROSTER[0] as any}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.getByText('Edit Student')).toBeInTheDocument();
  });

  it('pre-populates the name field when editing', () => {
    render(
      <StudentModal
        student={NBA_ROSTER[0] as any}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    const nameInput = screen.getByPlaceholderText('Enter student name') as HTMLInputElement;
    expect(nameInput.value).toBe('LeBron James');
  });

  it('calls onClose when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<StudentModal onClose={mockOnClose} onSave={mockOnSave} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with form data when submitted', async () => {
    mockOnSave.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<StudentModal onClose={mockOnClose} onSave={mockOnSave} />);

    await user.type(screen.getByPlaceholderText('Enter student name'), 'Jayson Tatum');
    await user.click(screen.getByRole('button', { name: /add student/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jayson Tatum' }),
      );
    });
  });

  it('shows an error message when onSave rejects', async () => {
    mockOnSave.mockRejectedValue(new Error('Duplicate entry'));
    const user = userEvent.setup();
    render(<StudentModal onClose={mockOnClose} onSave={mockOnSave} />);

    await user.type(screen.getByPlaceholderText('Enter student name'), 'Dupe Player');
    await user.click(screen.getByRole('button', { name: /add student/i }));

    await waitFor(() => {
      expect(screen.getByText('Duplicate entry')).toBeInTheDocument();
    });
  });

  it('renders status select with active/inactive/graduated options', () => {
    render(<StudentModal onClose={mockOnClose} onSave={mockOnSave} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = within(select).getAllByRole('option');
    const values = options.map((o) => o.textContent);

    expect(values).toContain('Active');
    expect(values).toContain('Inactive');
    expect(values).toContain('Graduated');
  });

  it('renders attendance and assignment range sliders', () => {
    render(<StudentModal onClose={mockOnClose} onSave={mockOnSave} />);

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the Calculated GPA preview section', () => {
    render(<StudentModal onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('Calculated GPA (Preview)')).toBeInTheDocument();
  });
});
