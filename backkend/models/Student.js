class Student {
  /**
   * The constructor takes a plain object with student data.
   */
  constructor({
    name,
    status,
    isScholarship,
    attendancePercentage,
    assignmentScore,
    userId,
  }) {
    this.name = name;
    this.status = status;
    this.isScholarship = isScholarship;
    this.attendancePercentage = attendancePercentage;
    this.assignmentScore = assignmentScore;
    this.userId = userId;

    // The calculated field's logic is called directly upon creation.
    this.gradePointAverage = this.calculateGPA();
  }

  /**
   * This method encapsulates the business logic for the calculated field.
   * If the inputs change, you only need to update the logic in this one place.
   * Formula: GPA = (assignmentScore/10 * 60%) + (attendancePercentage/10 * 40%)
   */
  calculateGPA() {
    if (this.assignmentScore == null || this.attendancePercentage == null) {
      return 0;
    }
    const gpa =
      (this.assignmentScore / 10) * 0.6 +
      (this.attendancePercentage / 10) * 0.4;
    return parseFloat(gpa.toFixed(2)); // Round to 2 decimal places
  }

  /**
   * A helper method that returns the student's data in a format
   * that matches the database table columns.
   */
  toDbObject() {
    return {
      name: this.name,
      status: this.status,
      is_scholarship: this.isScholarship,
      attendance_percentage: this.attendancePercentage,
      assignment_score: this.assignmentScore,
      grade_point_average: this.gradePointAverage,
      user_id: this.userId,
    };
  }
}

module.exports = Student;
