import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, LogOut, Search, Filter, ChevronLeft, ChevronRight, Award, TrendingUp, GraduationCap } from 'lucide-react';
import { api } from '../lib/api';
import StudentModal from './StudentModal';

interface Student {
  id: string;
  name: string;
  status: string;
  is_scholarship: number;
  attendance_percentage: number;
  assignment_score: number;
  grade_point_average?: number;
}

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const limit = 10;

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: { status?: string; search?: string } = {};
      if (statusFilter) filters.status = statusFilter;
      if (search) filters.search = search;

      const data = await api.students.getAll(page, limit, filters);

      if (Array.isArray(data)) {
        setStudents(data);
        setTotalPages(Math.ceil(data.length / limit) || 1);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter, search]);

  const handleAddStudent = async (studentData: any) => {
    try {
      await api.students.create(studentData);
      setShowModal(false);
      setPage(1);
      await fetchStudents();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateStudent = async (studentData: any) => {
    if (editingStudent) {
      try {
        await api.students.update(editingStudent.id, studentData);
        setShowModal(false);
        setEditingStudent(undefined);
        await fetchStudents();
      } catch (err) {
        throw err;
      }
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await api.students.delete(id);
      setShowDeleteConfirm(null);
      await fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    onLogout();
  };

  const stats = {
    total: students.length,
    scholarship: students.filter((s) => s.is_scholarship === 1).length,
    avgPerformance:
      students.length > 0
        ? (
            students.reduce(
              (acc, s) => acc + (s.grade_point_average || 0),
              0
            ) / students.length
          ).toFixed(1)
        : '0',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <nav className="glass border-b border-slate-700/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center pulse-glow">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                AI Campus Portal
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl transition-all duration-300 border border-slate-700 hover:border-slate-600 transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-slate-700/50 transform transition-all duration-300 hover:scale-105 hover:border-blue-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Students</p>
                <p className="text-4xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-2xl flex items-center justify-center pulse-glow">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-700/50 transform transition-all duration-300 hover:scale-105 hover:border-cyan-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Scholarship Students</p>
                <p className="text-4xl font-bold text-white mt-1">{stats.scholarship}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-400/20 rounded-2xl flex items-center justify-center pulse-glow">
                <Award className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-700/50 transform transition-all duration-300 hover:scale-105 hover:border-green-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Avg Performance</p>
                <p className="text-4xl font-bold text-white mt-1">{stats.avgPerformance}%</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-400/20 rounded-2xl flex items-center justify-center pulse-glow">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Students
            </h2>
            <button
              onClick={() => {
                setEditingStudent(undefined);
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-5 h-5" />
              <span>Add Student</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 animate-[scale-in_0.2s_ease-out]">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-8 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-16">
              <div className="relative inline-block w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-slate-400 text-lg">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-400 text-lg">No students found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 px-6 text-slate-300 font-semibold">Name</th>
                      <th className="text-left py-4 px-6 text-slate-300 font-semibold">Status</th>
                      <th className="text-left py-4 px-6 text-slate-300 font-semibold">Scholarship</th>
                      <th className="text-left py-4 px-6 text-slate-300 font-semibold">Attendance</th>
                      <th className="text-left py-4 px-6 text-slate-300 font-semibold">Assignment</th>
                      <th className="text-left py-4 px-6 text-slate-300 font-semibold">GPA</th>
                      <th className="text-right py-4 px-6 text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => (
                      <tr 
                        key={student.id} 
                        className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-all duration-200"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <td className="py-4 px-6 text-white font-medium">{student.name}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              student.status === 'active'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : student.status === 'inactive'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {student.is_scholarship === 1 ? (
                            <span className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                              <Award className="w-4 h-4" />
                              <span className="text-xs font-semibold">Yes</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-sm">No</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                                style={{ width: `${student.attendance_percentage}%` }}
                              />
                            </div>
                            <span className="text-slate-300 text-sm font-medium">{student.attendance_percentage}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-medium">{student.assignment_score}</td>
                        <td className="py-4 px-6">
                          <span className="text-white font-bold">{student.grade_point_average?.toFixed(1) || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingStudent(student);
                                setShowModal(true);
                              }}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-500/30"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(student.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-slate-400 text-sm">
                  Showing {students.length} students
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-slate-300 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                    Page {page}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={students.length < limit}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          onClose={() => {
            setShowModal(false);
            setEditingStudent(undefined);
          }}
          onSave={editingStudent ? handleUpdateStudent : handleAddStudent}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="glass rounded-2xl shadow-2xl border border-red-500/30 p-6 max-w-md w-full animate-[scale-in_0.2s_ease-out]">
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-slate-700/50 text-white rounded-xl font-medium hover:bg-slate-600/50 transition-all duration-300 border border-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
