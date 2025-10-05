import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Student {
  id?: string;
  name: string;
  status: string;
  is_scholarship?: number;
  isScholarship?: boolean;
  attendance_percentage?: number;
  attendancePercentage?: number;
  assignment_score?: number;
  assignmentScore?: number;
  grade_point_average?: number;
}

interface StudentModalProps {
  student?: Student;
  onClose: () => void;
  onSave: (student: any) => Promise<void>;
}

export default function StudentModal({ student, onClose, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    isScholarship: false,
    attendancePercentage: 80,
    assignmentScore: 75,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        status: student.status,
        isScholarship: student.is_scholarship === 1 || student.isScholarship === true,
        attendancePercentage: student.attendance_percentage || student.attendancePercentage || 80,
        assignmentScore: student.assignment_score || student.assignmentScore || 75,
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save student');
      setLoading(false);
    }
  };

  const performanceScore = ((formData.attendancePercentage + formData.assignmentScore) / 2).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
      <div className="glass rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[scale-in_0.3s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 glass border-b border-slate-700/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {student ? 'Edit Student' : 'Add New Student'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-xl border border-transparent hover:border-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Student Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter student name"
              required
            />
          </div>

          {/* Status and Scholarship */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Scholarship Status
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:bg-slate-800/50 transition-all duration-300 hover:border-cyan-500/50">
                <input
                  type="checkbox"
                  checked={formData.isScholarship}
                  onChange={(e) => setFormData({ ...formData, isScholarship: e.target.checked })}
                  className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                />
                <span className="text-slate-300 font-medium">Scholarship Student</span>
              </label>
            </div>
          </div>

          {/* Attendance and Assignment Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Attendance Percentage * 
                <span className="ml-2 text-blue-400 font-bold">{formData.attendancePercentage}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.attendancePercentage}
                onChange={(e) =>
                  setFormData({ ...formData, attendancePercentage: Number(e.target.value) })
                }
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Assignment Score * 
                <span className="ml-2 text-cyan-400 font-bold">{formData.assignmentScore}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.assignmentScore}
                onChange={(e) =>
                  setFormData({ ...formData, assignmentScore: Number(e.target.value) })
                }
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Performance Score Display */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-semibold text-lg">Calculated GPA (Preview)</span>
                  <p className="text-xs text-slate-400 mt-1">
                    This will be saved to backend
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {performanceScore}%
                  </div>
                </div>
              </div>
              {student?.grade_point_average && (
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Current GPA from Backend:</span>
                    <span className="text-cyan-400 font-bold text-lg">{student.grade_point_average.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm animate-[scale-in_0.2s_ease-out]">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700/50 text-white rounded-xl font-semibold hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300 border border-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : student ? (
                'Update Student'
              ) : (
                'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
