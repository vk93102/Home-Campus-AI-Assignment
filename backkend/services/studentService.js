const db = require("../config/database");
const Student = require("../models/Student");

class StudentService {
  async create(studentData) {
    const student = new Student(studentData);
    const data = student.toDbObject();
    // Uses db.run() for inserting a new student.
    const sql = `INSERT INTO students (name, status, is_scholarship, attendance_percentage, assignment_score, grade_point_average, user_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = Object.values(data);
    const result = await db.run(sql, params);
    return { id: result.id };
  }

  async findAll(options = {}, userId) {
    const { status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    let sql = "SELECT * FROM students WHERE user_id = ?";
    let params = [userId];
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    return db.all(sql, params);
  }

  async findById(id, userId) {
    // Uses db.get() for fetching a single student.
    const sql = "SELECT * FROM students WHERE id = ? AND user_id = ?";
    return db.get(sql, [id, userId]);
  }

  async update(id, studentData) {
    // Uses db.run() for updating a record.
    const student = new Student(studentData);
    const data = student.toDbObject();
    const sql = `UPDATE students SET name = ?, status = ?, is_scholarship = ?, attendance_percentage = ?, assignment_score = ?, grade_point_average = ?
                     WHERE id = ? AND user_id = ?`;
    const params = [...Object.values(data), id, data.user_id];
    const result = await db.run(sql, params);
    if (result.changes === 0)
      throw new Error("Student not found or user not authorized");
    return result;
  }

  async delete(id, userId) {
    // Uses db.run() for deleting a record.
    const sql = "DELETE FROM students WHERE id = ? AND user_id = ?";
    const result = await db.run(sql, [id, userId]);
    if (result.changes === 0)
      throw new Error("Student not found or user not authorized");
    return result;
  }
}

module.exports = new StudentService();
