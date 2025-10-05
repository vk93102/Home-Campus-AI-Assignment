const studentService = require('../services/studentService');

class StudentController {
    createStudent = async (req, res) => {
        try {
            const { name, status, isScholarship, attendancePercentage, assignmentScore } = req.body;
            const requiredFields = { name, status, isScholarship, attendancePercentage, assignmentScore };

            // --- FIX: Comprehensive validation for all required fields ---
            for (const [field, value] of Object.entries(requiredFields)) {
                if (value === undefined || value === null) {
                    return res.status(400).json({ message: `${field} is a required field.` });
                }
            }
            if (typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ message: 'name must be a non-empty string.' });
            }
            if (typeof isScholarship !== 'boolean') {
                return res.status(400).json({ message: 'isScholarship must be a boolean.' });
            }
            if (typeof attendancePercentage !== 'number' || attendancePercentage < 0 || attendancePercentage > 100) {
                return res.status(400).json({ message: 'attendancePercentage must be a number between 0 and 100.' });
            }
            if (typeof assignmentScore !== 'number' || assignmentScore < 0 || assignmentScore > 100) {
                return res.status(400).json({ message: 'assignmentScore must be a number between 0 and 100.' });
            }

            const studentData = { ...req.body, userId: req.user.userId };
            const student = await studentService.create(studentData);
            res.status(201).json(student);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message });
        }
    };

    getAllStudents = async (req, res) => {
        try {
            const students = await studentService.findAll(req.query, req.user.userId);
            res.json(students);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    };
    
    getStudentById = async (req, res) => {
        try {
            const student = await studentService.findById(req.params.id, req.user.userId);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.json(student);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    updateStudent = async (req, res) => {
        try {
            const studentData = { ...req.body, userId: req.user.userId };
            await studentService.update(req.params.id, studentData);
            res.json({ message: 'Student updated successfully' });
        } catch (error) {
            res.status(error.statusCode || 404).json({ message: error.message });
        }
    };

    deleteStudent = async (req, res) => {
        try {
            await studentService.delete(req.params.id, req.user.userId);
            res.status(200).json({ message: 'Student deleted successfully' });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };
}

module.exports = new StudentController();
