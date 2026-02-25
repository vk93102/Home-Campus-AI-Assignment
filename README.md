# 🏗️ Architecture & Design Decisions

Comprehensive documentation of architectural choices, OOP principles, design patterns, and technical reasoning.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack Reasoning](#technology-stack-reasoning)
3. [OOP Principles Implementation](#oop-principles-implementation)
4. [Design Patterns](#design-patterns)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Security Architecture](#security-architecture)
8. [Performance Optimizations](#performance-optimizations)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Frontend (TypeScript)                          │  │
│  │  - Components (UI)                                    │  │
│  │  - State Management (useState, useEffect)            │  │
│  │  - API Client (Axios)                                │  │
│  │  - Routing (React Router)                            │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/JSON
                       │ JWT Token in Header
┌──────────────────────▼──────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                    │  │
│  │  - CORS Middleware                                    │  │
│  │  - JWT Authentication Middleware                      │  │
│  │  - Request Validation Middleware                      │  │
│  │  - Error Handling Middleware                          │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │ Controllers │  │  Services   │  │  Validators  │        │
│  │ (Routes)    │──│  (Logic)    │──│  (Rules)     │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                       DATA ACCESS LAYER                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Models (ORM-like)                                    │  │
│  │  - Student Model                                      │  │
│  │  - User Model                                         │  │
│  │  - Database Helper (SQLite wrapper)                  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      PERSISTENCE LAYER                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SQLite Database (data.sqlite)                        │  │
│  │  - users table                                        │  │
│  │  - students table                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Style

**Chosen:** **Layered (N-Tier) Architecture** with **RESTful API** design

**Reasons:**

1. **Separation of Concerns:** Each layer has a specific responsibility
2. **Testability:** Layers can be tested independently
3. **Maintainability:** Changes in one layer don't affect others
4. **Scalability:** Layers can be scaled independently
5. **Industry Standard:** Well-understood pattern with extensive documentation

**Benefits:**

- ✅ Clear boundaries between presentation, business logic, and data
- ✅ Easy to add new features without breaking existing code
- ✅ Supports multiple clients (web, mobile) using the same API
- ✅ Enables parallel development (frontend/backend teams)

---

## Technology Stack Reasoning

### Backend: Express.js + SQLite

#### Why Express.js?

| Factor          | Reason                                                   |
| --------------- | -------------------------------------------------------- |
| **Maturity**    | Battle-tested framework with 10+ years of production use |
| **Ecosystem**   | Massive npm ecosystem (400,000+ packages)                |
| **Performance** | Non-blocking I/O, handles 10,000+ req/sec easily         |
| **Simplicity**  | Minimal boilerplate, quick to set up                     |
| **Flexibility** | No opinionated structure, choose your own patterns       |
| **Community**   | Large community, extensive documentation                 |

**Alternatives Considered:**

- **Django (Python):** Rejected due to heavier runtime, slower for small projects
- **Spring Boot (Java):** Rejected due to verbose syntax, longer dev time
- **FastAPI (Python):** Rejected due to less mature ecosystem
- **NestJS (Node):** Rejected due to complexity overkill for this project size

#### Why SQLite?

| Factor                 | Reason                                           |
| ---------------------- | ------------------------------------------------ |
| **Zero Configuration** | No separate database server needed               |
| **Portability**        | Single file database, easy to backup/move        |
| **Performance**        | Faster than client-server DBs for < 100K records |
| **Reliability**        | ACID compliant, used in billions of devices      |
| **Development Speed**  | No network latency, instant queries              |

**Production Readiness:**

- ✅ Handles 100,000+ queries/sec
- ✅ Supports up to 281 TB database size
- ✅ Used by Apple, Google, Microsoft in production
- ⚠️ **Limitation:** Single-writer (fine for < 100 concurrent writes/sec)

**When to Migrate to PostgreSQL:**

- User base > 10,000 concurrent users
- Multiple app servers (horizontal scaling)
- Need for advanced features (full-text search, JSON queries)

### Frontend: React + Vite + TypeScript

#### Why React?

| Factor                    | Reason                                                |
| ------------------------- | ----------------------------------------------------- |
| **Component Reusability** | Build once, use everywhere                            |
| **Virtual DOM**           | Efficient updates, smooth UI                          |
| **Ecosystem**             | Largest library ecosystem (shadcn/ui, Recharts, etc.) |
| **Developer Experience**  | Fast refresh, great dev tools                         |
| **Hiring Pool**           | Largest pool of frontend developers                   |

**Alternatives Considered:**

- **Vue.js:** Rejected due to smaller ecosystem
- **Angular:** Rejected due to steep learning curve, verbosity
- **Svelte:** Rejected due to smaller community, fewer libraries

#### Why Vite?

| Factor         | Reason                                              |
| -------------- | --------------------------------------------------- |
| **Speed**      | 10-100x faster than Webpack (cold start < 1 second) |
| **Modern**     | Native ESM, no bundling in dev                      |
| **HMR**        | Instant hot module replacement                      |
| **Build Size** | Optimized production builds (Rollup-based)          |

**vs Webpack:**

- Development server startup: **0.8s (Vite)** vs **15s (Webpack)**
- Hot reload: **< 50ms (Vite)** vs **500ms+ (Webpack)**

#### Why TypeScript?

| Factor              | Benefit                                   |
| ------------------- | ----------------------------------------- |
| **Type Safety**     | Catch errors at compile time, not runtime |
| **IntelliSense**    | Auto-complete, refactoring support        |
| **Documentation**   | Types serve as inline documentation       |
| **Maintainability** | Easier to refactor large codebases        |

**Developer Productivity:**

- 15% fewer bugs in production (Microsoft study)
- 20% faster development with large teams
- Better IDE support (VS Code, WebStorm)

---

## OOP Principles Implementation

### 1. Encapsulation

**Definition:** Bundling data and methods that operate on data within a single unit (class), hiding internal state.

#### Backend Example: Student Model

```javascript
// filepath: backend/src/models/Student.js
class Student {
  constructor(data) {
    // Private-like properties (convention: prefix with _)
    this._id = data.id;
    this._name = data.name;
    this._status = data.status;
    this._attendancePercentage = data.attendancePercentage;
    this._assignmentScore = data.assignmentScore;

    // Encapsulated: GPA is calculated, not stored
    this._gpa = this.calculateGPA();
  }

  // Public getter methods (read-only access)
  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get gpa() {
    return this._gpa;
  }

  // Private method (encapsulated business logic)
  calculateGPA() {
    return (
      (this._attendancePercentage * 0.4 + this._assignmentScore * 0.6) / 10
    );
  }

  // Public method with validation
  updateScores(attendance, assignment) {
    if (attendance < 0 || attendance > 100) {
      throw new Error("Attendance must be 0-100");
    }
    if (assignment < 0 || assignment > 100) {
      throw new Error("Assignment score must be 0-100");
    }
    this._attendancePercentage = attendance;
    this._assignmentScore = assignment;
    this._gpa = this.calculateGPA(); // Recalculate GPA
  }

  // Convert to database format (hides internal representation)
  toDbObject() {
    return {
      id: this._id,
      name: this._name,
      status: this._status,
      attendance_percentage: this._attendancePercentage,
      assignment_score: this._assignmentScore,
      grade_point_average: this._gpa,
    };
  }
}

module.exports = Student;
```

**Benefits:**

- ✅ GPA calculation logic hidden from external code
- ✅ Validation enforced in one place
- ✅ Internal data format (camelCase) vs DB format (snake_case) abstracted
- ✅ Changes to GPA formula only require updating one method

#### Frontend Example: API Client

```typescript
// filepath: frontend/src/utils/api.ts
class ApiClient {
  private baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({ baseURL });

    // Encapsulated: auto-attach token to requests
    this.axiosInstance.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Private helper (hidden from external code)
  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  // Public interface (abstracts HTTP details)
  async getStudents(params?: StudentQueryParams): Promise<Student[]> {
    const response = await this.axiosInstance.get("/students", { params });
    return response.data.data;
  }

  async createStudent(data: CreateStudentDTO): Promise<Student> {
    const response = await this.axiosInstance.post("/students", data);
    return response.data.data;
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);
```

**Benefits:**

- ✅ Token management hidden from components
- ✅ HTTP implementation details abstracted
- ✅ Easy to switch from axios to fetch without changing components

---

### 2. Abstraction

**Definition:** Hiding complex implementation details, exposing only essential features.

#### Backend Example: Database Service

```javascript
// filepath: backend/src/services/StudentService.js
class StudentService {
  constructor(db) {
    this.db = db; // Database abstraction
  }

  // Abstract interface: user doesn't know about SQL
  async findAll(userId, filters = {}) {
    // Complex SQL query abstracted away
    const { status, page = 1, limit = 10, search } = filters;
    let query = "SELECT * FROM students WHERE user_id = ?";
    const params = [userId];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    if (search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    return this.db.all(query, params);
  }

  async create(studentData, userId) {
    const student = new Student({ ...studentData, userId });

    // Abstract: user doesn't know about GPA calculation
    const dbData = student.toDbObject();

    const result = await this.db.run(
      `INSERT INTO students (...) VALUES (?, ?, ?, ...)`,
      Object.values(dbData)
    );

    return { ...dbData, id: result.lastID };
  }
}

module.exports = StudentService;
```

**Benefits:**

- ✅ Controllers don't know about SQL syntax
- ✅ Business logic separated from data access
- ✅ Easy to swap SQLite for PostgreSQL later

#### Frontend Example: Student Hook

```typescript
// filepath: frontend/src/hooks/useStudents.ts
function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Abstract: component doesn't handle API calls
  const fetchStudents = async (filters?: StudentFilters) => {
    setLoading(true);
    try {
      const data = await apiClient.getStudents(filters);
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (data: CreateStudentDTO) => {
    const newStudent = await apiClient.createStudent(data);
    setStudents((prev) => [newStudent, ...prev]);
  };

  return { students, loading, error, fetchStudents, createStudent };
}
```

**Benefits:**

- ✅ Components don't handle loading/error states
- ✅ API call logic reusable across components
- ✅ Easier to test (mock the hook)

---

### 3. Inheritance

**Definition:** Creating new classes from existing ones, inheriting properties and methods.

#### Backend Example: Base Controller

```javascript
// filepath: backend/src/controllers/BaseController.js
class BaseController {
  // Common error handling for all controllers
  handleError(res, error, statusCode = 500) {
    console.error(error);
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }

  // Common success response
  sendSuccess(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  // Common validation
  validateRequired(fields, body) {
    const missing = fields.filter((field) => !body[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  }
}

// filepath: backend/src/controllers/StudentController.js
class StudentController extends BaseController {
  constructor(studentService) {
    super(); // Call parent constructor
    this.studentService = studentService;
  }

  async create(req, res) {
    try {
      // Use inherited validation method
      this.validateRequired(
        ["name", "status", "attendancePercentage"],
        req.body
      );

      const student = await this.studentService.create(req.body, req.user.id);

      // Use inherited success response
      return this.sendSuccess(res, student, "Student created", 201);
    } catch (error) {
      // Use inherited error handling
      return this.handleError(res, error, 400);
    }
  }
}

module.exports = StudentController;
```

**Benefits:**

- ✅ Eliminates duplicate error handling code
- ✅ Consistent response format across all controllers
- ✅ Easy to add common functionality (logging, metrics)

---

### 4. Polymorphism

**Definition:** Objects of different types can be accessed through the same interface.

#### Backend Example: Service Interface

```javascript
// filepath: backend/src/services/IService.js (interface pattern)
class IService {
  async findAll(userId, filters) {
    throw new Error("Method not implemented");
  }
  async findById(id, userId) {
    throw new Error("Method not implemented");
  }
  async create(data, userId) {
    throw new Error("Method not implemented");
  }
  async update(id, data, userId) {
    throw new Error("Method not implemented");
  }
  async delete(id, userId) {
    throw new Error("Method not implemented");
  }
}

// filepath: backend/src/services/StudentService.js
class StudentService extends IService {
  // Implement all methods...
  async findAll(userId, filters) {
    /* implementation */
  }
  // ...
}

// filepath: backend/src/services/TeacherService.js (hypothetical)
class TeacherService extends IService {
  // Different implementation, same interface
  async findAll(userId, filters) {
    /* different logic */
  }
  // ...
}

// filepath: backend/src/controllers/GenericController.js
class GenericController {
  constructor(service) {
    this.service = service; // Can be StudentService or TeacherService
  }

  async getAll(req, res) {
    // Same code works for both services (polymorphism)
    const data = await this.service.findAll(req.user.id, req.query);
    return res.json({ success: true, data });
  }
}
```

**Benefits:**

- ✅ Add new entity types (Teacher, Course) without changing controller
- ✅ Same CRUD logic for all entities
- ✅ Easier to test (mock the service interface)

#### Frontend Example: Form Components

```typescript
// Base form props interface
interface BaseFormProps<T> {
  onSubmit: (data: T) => Promise<void>;
  onCancel: () => void;
  initialData?: T;
}

// Student form
function StudentForm({ onSubmit, onCancel, initialData }: BaseFormProps<StudentDTO>) {
  // Implementation specific to students
}

// Teacher form (hypothetical)
function TeacherForm({ onSubmit, onCancel, initialData }: BaseFormProps<TeacherDTO>) {
  // Different implementation, same interface
}

// Modal wrapper (polymorphic usage)
function FormModal<T>({ FormComponent, ...props }: { FormComponent: React.FC<BaseFormProps<T>> } & BaseFormProps<T>) {
  return (
    <Dialog>
      <FormComponent {...props} />
    </Dialog>
  );
}

// Usage:
<FormModal FormComponent={StudentForm} onSubmit={handleSubmitStudent} />
<FormModal FormComponent={TeacherForm} onSubmit={handleSubmitTeacher} />
```

**Benefits:**

- ✅ Reusable modal logic
- ✅ Type-safe forms
- ✅ Easy to add new form types

---

### 5. SOLID Principles

#### S - Single Responsibility Principle

**"A class should have one, and only one, reason to change."**

**Example:**

```javascript
// ❌ BAD: StudentController does too much
class StudentController {
  async create(req, res) {
    // Validation
    if (!req.body.name) return res.status(400).json({ error: "Name required" });

    // Business logic
    const gpa = (req.body.attendance * 0.4 + req.body.assignment * 0.6) / 10;

    // Database access
    const result = db.run("INSERT INTO students...", [req.body.name, gpa]);

    // Response formatting
    return res.json({ success: true, data: { id: result.lastID } });
  }
}

// ✅ GOOD: Separated responsibilities
class StudentValidator {
  validate(data) {
    if (!data.name) throw new Error("Name required");
    // ...
  }
}

class StudentService {
  create(data) {
    const student = new Student(data); // Business logic (GPA calc)
    return this.repository.save(student);
  }
}

class StudentController {
  async create(req, res) {
    try {
      this.validator.validate(req.body);
      const student = await this.service.create(req.body);
      return res.json({ success: true, data: student });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
```

#### O - Open/Closed Principle

**"Software entities should be open for extension, but closed for modification."**

**Example:**

```javascript
// ✅ GOOD: Extend without modifying
class BaseValidator {
  validate(data) {
    // Common validation
  }
}

class StudentValidator extends BaseValidator {
  validate(data) {
    super.validate(data); // Reuse base validation
    // Add student-specific validation
    if (data.attendancePercentage < 0 || data.attendancePercentage > 100) {
      throw new Error("Invalid attendance percentage");
    }
  }
}

class TeacherValidator extends BaseValidator {
  validate(data) {
    super.validate(data);
    // Add teacher-specific validation
    if (!data.department) {
      throw new Error("Department is required for teachers");
    }
  }
}
```

#### L - Liskov Substitution Principle

**"Objects should be replaceable with instances of their subtypes without altering correctness."**

**Example:**

```javascript
// Base class contract
class Repository {
  async save(entity) {
    // Must return the saved entity with an ID
    throw new Error("Not implemented");
  }
}

// Subclass respects contract
class SQLiteRepository extends Repository {
  async save(entity) {
    const result = await this.db.run("INSERT...", entity.toDbObject());
    return { ...entity, id: result.lastID }; // Returns entity with ID
  }
}

class PostgreSQLRepository extends Repository {
  async save(entity) {
    const result = await this.pool.query(
      "INSERT... RETURNING *",
      entity.toDbObject()
    );
    return result.rows[0]; // Returns entity with ID
  }
}

// Service works with any repository (Liskov substitution)
class StudentService {
  constructor(repository) {
    this.repository = repository; // Can be SQLite or PostgreSQL
  }

  async create(data) {
    const student = new Student(data);
    return this.repository.save(student); // Works with both
  }
}
```

#### I - Interface Segregation Principle

**"Clients should not be forced to depend on interfaces they don't use."**

**Example:**

```javascript
// ❌ BAD: Fat interface
interface IStudentService {
  findAll(): Promise<Student[]>;
  findById(id: number): Promise<Student>;
  create(data: StudentDTO): Promise<Student>;
  update(id: number, data: StudentDTO): Promise<Student>;
  delete(id: number): Promise<void>;
  exportToCSV(): Promise<string>;
  sendEmailNotification(id: number): Promise<void>;
  generateReport(): Promise<Buffer>;
}

// ✅ GOOD: Segregated interfaces
interface IStudentReader {
  findAll(): Promise<Student[]>;
  findById(id: number): Promise<Student>;
}

interface IStudentWriter {
  create(data: StudentDTO): Promise<Student>;
  update(id: number, data: StudentDTO): Promise<Student>;
  delete(id: number): Promise<void>;
}

interface IStudentExporter {
  exportToCSV(): Promise<string>;
}

interface IStudentNotifier {
  sendEmailNotification(id: number): Promise<void>;
}

// Implement only what you need
class StudentService implements IStudentReader, IStudentWriter {
  // Only implements CRUD methods
}

class StudentReportService implements IStudentExporter {
  // Only implements export
}
```

#### D - Dependency Inversion Principle

**"Depend on abstractions, not concretions."**

**Example:**

```javascript
// ❌ BAD: Direct dependency on SQLite
class StudentService {
  constructor() {
    this.db = new SQLiteDatabase("data.sqlite"); // Tight coupling
  }
}

// ✅ GOOD: Depend on abstraction
interface IDatabase {
  run(sql: string, params: any[]): Promise<{ lastID: number }>;
  get(sql: string, params: any[]): Promise<any>;
  all(sql: string, params: any[]): Promise<any[]>;
}

class SQLiteDatabase implements IDatabase {
  run(sql, params) {
    /* SQLite implementation */
  }
  get(sql, params) {
    /* SQLite implementation */
  }
  all(sql, params) {
    /* SQLite implementation */
  }
}

class StudentService {
  constructor(database: IDatabase) {
    this.db = database; // Depends on interface, not implementation
  }
}

// Can inject any database implementation
const sqliteDb = new SQLiteDatabase("data.sqlite");
const studentService = new StudentService(sqliteDb);

// Easy to swap for PostgreSQL later
const postgresDb = new PostgreSQLDatabase(connectionString);
const studentService2 = new StudentService(postgresDb);

// Easy to mock for testing
const mockDb = new MockDatabase();
const studentServiceForTesting = new StudentService(mockDb);
```

---

## Design Patterns

### 1. Repository Pattern

**Purpose:** Abstract data access logic, provide a collection-like interface.

**Implementation:**

```javascript
// filepath: backend/src/repositories/StudentRepository.js
class StudentRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll(filters = {}) {
    const { userId, status, page = 1, limit = 10 } = filters;
    let sql = "SELECT * FROM students WHERE user_id = ?";
    const params = [userId];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    const rows = await this.db.all(sql, params);
    return rows.map((row) => this.mapToEntity(row));
  }

  async findById(id, userId) {
    const row = await this.db.get(
      "SELECT * FROM students WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return row ? this.mapToEntity(row) : null;
  }

  async save(student) {
    if (student.id) {
      return this.update(student);
    } else {
      return this.insert(student);
    }
  }

  async insert(student) {
    const data = student.toDbObject();
    const result = await this.db.run(
      `INSERT INTO students (user_id, name, status, ...) VALUES (?, ?, ?, ...)`,
      Object.values(data)
    );
    return this.findById(result.lastID, student.userId);
  }

  async update(student) {
    const data = student.toDbObject();
    await this.db.run(
      `UPDATE students SET name = ?, status = ?, ... WHERE id = ? AND user_id = ?`,
      [...Object.values(data), student.id, student.userId]
    );
    return this.findById(student.id, student.userId);
  }

  async delete(id, userId) {
    await this.db.run("DELETE FROM students WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);
  }

  // Map database row to domain entity
  mapToEntity(row) {
    return new Student({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      status: row.status,
      isScholarship: Boolean(row.is_scholarship),
      attendancePercentage: row.attendance_percentage,
      assignmentScore: row.assignment_score,
      gradePointAverage: row.grade_point_average,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

module.exports = StudentRepository;
```

**Benefits:**

- ✅ Service layer doesn't know about SQL
- ✅ Easy to swap databases
- ✅ Centralized mapping logic
- ✅ Testable (mock repository)

---

### 2. Service Layer Pattern

**Purpose:** Encapsulate business logic, coordinate between repositories and controllers.

**Implementation:**

```javascript
// filepath: backend/src/services/StudentService.js
class StudentService {
  constructor(studentRepository, userRepository) {
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
  }

  async createStudent(data, userId) {
    // Business rule: check user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Business rule: validate data
    this.validateStudentData(data);

    // Create domain entity (encapsulates GPA calculation)
    const student = new Student({ ...data, userId });

    // Save via repository
    return this.studentRepository.save(student);
  }

  async updateStudent(id, data, userId) {
    // Business rule: student must exist and belong to user
    const existing = await this.studentRepository.findById(id, userId);
    if (!existing) {
      throw new Error("Student not found or access denied");
    }

    // Business rule: validate updates
    this.validateStudentData(data, true);

    // Update entity (GPA recalculated if scores changed)
    existing.update(data);

    return this.studentRepository.save(existing);
  }

  async getStatistics(userId) {
    const students = await this.studentRepository.findAll({ userId });

    // Business logic: calculate stats
    return {
      total: students.length,
      active: students.filter((s) => s.status === "active").length,
      withScholarship: students.filter((s) => s.isScholarship).length,
      averageGPA:
        students.reduce((sum, s) => sum + s.gpa, 0) / students.length || 0,
    };
  }

  validateStudentData(data, isUpdate = false) {
    // Business rules
    if (!isUpdate && !data.name) {
      throw new Error("Name is required");
    }
    if (data.attendancePercentage < 0 || data.attendancePercentage > 100) {
      throw new Error("Attendance must be between 0 and 100");
    }
    // ...
  }
}

module.exports = StudentService;
```

**Benefits:**

- ✅ Business logic separated from data access
- ✅ Reusable across controllers (REST API, GraphQL, CLI)
- ✅ Easy to test (mock repositories)
- ✅ Single place for business rules

---

### 3. Middleware Pattern

**Purpose:** Process requests in a pipeline before reaching controllers.

**Implementation:**

```javascript
// filepath: backend/src/middleware/auth.js
function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user to request
    next(); // Continue to next middleware/controller
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// filepath: backend/src/middleware/validate.js
function validateStudent(req, res, next) {
  const { name, status, attendancePercentage, assignmentScore } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  if (!["active", "inactive", "graduated"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  if (attendancePercentage < 0 || attendancePercentage > 100) {
    return res.status(400).json({ error: "Attendance must be 0-100" });
  }

  if (assignmentScore < 0 || assignmentScore > 100) {
    return res.status(400).json({ error: "Assignment score must be 0-100" });
  }

  next(); // Validation passed
}

// filepath: backend/src/routes/students.js
router.post(
  "/students",
  authenticate,
  validateStudent,
  studentController.create
);
//                        ^^^^^^^^^^^  ^^^^^^^^^^^^^^  Request flows through middlewares
```

**Benefits:**

- ✅ Reusable validation logic
- ✅ Separation of concerns (auth, validation, logging)
- ✅ Easy to add/remove middleware
- ✅ Clean controller code

---

### 4. Factory Pattern

**Purpose:** Create objects without specifying exact class.

**Implementation:**

```javascript
// filepath: backend/src/factories/ResponseFactory.js
class ResponseFactory {
  static success(data, message = "Success", statusCode = 200) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(error, statusCode = 500) {
    return {
      success: false,
      error: error.message || "Internal server error",
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(errors) {
    return {
      success: false,
      error: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static paginatedResponse(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Usage in controller
class StudentController {
  async getAll(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const students = await this.service.findAll(req.user.id, req.query);
    const total = await this.service.count(req.user.id);

    return res.json(
      ResponseFactory.paginatedResponse(students, page, limit, total)
    );
  }

  async create(req, res) {
    try {
      const student = await this.service.create(req.body, req.user.id);
      return res
        .status(201)
        .json(ResponseFactory.success(student, "Student created", 201));
    } catch (error) {
      return res.status(400).json(ResponseFactory.error(error, 400));
    }
  }
}
```

**Benefits:**

- ✅ Consistent response format
- ✅ Easy to change response structure globally
- ✅ Self-documenting (clear intent)

---

### 5. Singleton Pattern

**Purpose:** Ensure only one instance of a class exists.

**Implementation:**

```javascript
// filepath: backend/db.js
const Database = require("better-sqlite3");

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance; // Return existing instance
    }

    this.db = new Database("data.sqlite");
    this.db.pragma("journal_mode = WAL"); // Performance optimization

    DatabaseConnection.instance = this;
  }

  run(sql, params = []) {
    return this.db.prepare(sql).run(params);
  }

  get(sql, params = []) {
    return this.db.prepare(sql).get(params);
  }

  all(sql, params = []) {
    return this.db.prepare(sql).all(params);
  }

  close() {
    this.db.close();
    DatabaseConnection.instance = null;
  }
}

// Export single instance
module.exports = new DatabaseConnection();
```

**Benefits:**

- ✅ Only one database connection
- ✅ Connection reused across entire app
- ✅ Prevents connection leaks

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── controllers/           # HTTP request handlers
│   │   ├── BaseController.js  # Abstract base class
│   │   ├── AuthController.js  # Signup, login
│   │   └── StudentController.js  # Student CRUD
│   │
│   ├── services/              # Business logic
│   │   ├── AuthService.js     # JWT generation, password hashing
│   │   └── StudentService.js  # Student business rules
│   │
│   ├── repositories/          # Data access
│   │   ├── UserRepository.js
│   │   └── StudentRepository.js
│   │
│   ├── models/                # Domain entities
│   │   ├── User.js
│   │   └── Student.js
│   │
│   ├── middleware/            # Request processing pipeline
│   │   ├── auth.js            # JWT verification
│   │   ├── validate.js        # Input validation
│   │   ├── errorHandler.js    # Global error handling
│   │   └── cors.js            # CORS configuration
│   │
│   ├── routes/                # API route definitions
│   │   ├── auth.js            # /auth/signup, /auth/login
│   │   └── students.js        # /api/students/*
│   │
│   ├── utils/                 # Helper functions
│   │   ├── ResponseFactory.js
│   │   └── logger.js
│   │
│   └── config/                # Configuration
│       └── database.js
│
├── tests/                     # Test suite
│   ├── testing.sh             # Bash test runner
│   └── README.md
│
├── db.js                      # Database singleton
├── init-db.js                 # Database initialization script
├── server.js                  # Express app entry point
├── package.json
└── .env                       # Environment variables
```

### Request Flow

```
HTTP Request
    │
    ▼
┌────────────────────────┐
│  Express Middleware    │
│  - CORS                │
│  - Body Parser         │
│  - Logging             │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Authentication        │
│  - JWT verification    │
│  - req.user populated  │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Validation            │
│  - Check required      │
│  - Type checking       │
│  - Range validation    │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Controller            │
│  - Parse request       │
│  - Call service        │
│  - Format response     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Service               │
│  - Business logic      │
│  - Call repository     │
│  - Return data         │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Repository            │
│  - Build SQL query     │
│  - Execute query       │
│  - Map to entity       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Database              │
│  - Execute query       │
│  - Return rows         │
└────────┬───────────────┘
         │
         ▼
    JSON Response
```

---

## Frontend Architecture

### Component Hierarchy

```
App
 │
 ├── AuthProvider (Context)
 │    │
 │    ├── Login Page
 │    │    └── Auth Component
 │    │
 │    └── Dashboard Page
 │         ├── Header
 │         │    ├── Logo
 │         │    ├── SearchBar
 │         │    └── UserMenu
 │         │
 │         ├── StatsCards (4 cards)
 │         │    ├── TotalStudents
 │         │    ├── ActiveStudents
 │         │    ├── Scholarships
 │         │    └── AverageGPA
 │         │
 │         ├── Filters
 │         │    ├── StatusFilter
 │         │    ├── ScholarshipFilter
 │         │    └── SortDropdown
 │         │
 │         ├── StudentsTable
 │         │    ├── TableHeader
 │         │    │    ├── SortableColumn (Name)
 │         │    │    ├── SortableColumn (Email)
 │         │    │    └── ...
 │         │    │
 │         │    └── StudentRow (repeated)
 │         │         ├── NameCell
 │         │         ├── StatusBadge
 │         │         ├── GPAProgress
 │         │         └── ActionButtons
 │         │              ├── EditButton
 │         │              └── DeleteButton
 │         │
 │         ├── Pagination
 │         │    ├── PrevButton
 │         │    ├── PageNumbers
 │         │    └── NextButton
 │         │
 │         └── StudentModal
 │              ├── Form
 │              │    ├── NameInput
 │              │    ├── EmailInput
 │              │    ├── StatusSelect
 │              │    ├── ScholarshipCheckbox
 │              │    ├── AttendanceInput
 │              │    └── AssignmentInput
 │              │
 │              └── FormActions
 │                   ├── SubmitButton
 │                   └── CancelButton
```

### State Management

```typescript
// Global State (Context API)
interface AuthContext {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Local State (useState in Dashboard)
interface DashboardState {
  students: Student[];
  filteredStudents: Student[];
  currentPage: number;
  filters: {
    status: string;
    scholarship: boolean | null;
    search: string;
  };
  sortBy: string;
  sortOrder: "asc" | "desc";
  isModalOpen: boolean;
  editingStudent: Student | null;
  stats: Statistics;
  loading: boolean;
  error: string | null;
}

// Derived State (useMemo)
const paginatedStudents = useMemo(() => {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
}, [filteredStudents, currentPage]);

const totalPages = useMemo(() => {
  return Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
}, [filteredStudents.length]);
```

### Data Flow

```
User Action (e.g., Create Student)
    │
    ▼
Event Handler in Component
    │
    ▼
Validation (client-side)
    │
    ▼
API Call (axios)
    │
    ▼
Backend Processing
    │
    ▼
Response Received
    │
    ▼
Update Local State (setStudents)
    │
    ▼
Re-render Component
    │
    ▼
Show Success Toast
```

---

## Security Architecture

### Authentication Flow

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│ Frontend │                  │ Backend  │                  │ Database │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │                             │                             │
     │ POST /auth/signup           │                             │
     ├────────────────────────────>│                             │
     │ {username, password}        │                             │
     │                             │ hash password (bcrypt)      │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │                             │                             │
     │                             │ INSERT user                 │
     │                             ├────────────────────────────>│
     │                             │                             │
     │                             │<────────────────────────────┤
     │                             │ user created                │
     │<────────────────────────────┤                             │
     │ 201 Created                 │                             │
     │                             │                             │
     │ POST /auth/login            │                             │
     ├────────────────────────────>│                             │
     │ {username, password}        │                             │
     │                             │ SELECT user                 │
     │                             ├────────────────────────────>│
     │                             │                             │
     │                             │<────────────────────────────┤
     │                             │ user record                 │
     │                             │                             │
     │                             │ verify password (bcrypt)    │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │                             │                             │
     │                             │ generate JWT                │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │<────────────────────────────┤                             │
     │ { token: "eyJ..." }         │                             │
     │                             │                             │
     │ save token to localStorage  │                             │
     │────────┐                    │                             │
     │        │                    │                             │
     │<───────┘                    │                             │
     │                             │                             │
     │ GET /api/students           │                             │
     │ Authorization: Bearer token │                             │
     ├────────────────────────────>│                             │
     │                             │ verify JWT                  │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │                             │                             │
     │                             │ extract userId from token   │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │                             │                             │
     │                             │ SELECT students WHERE       │
     │                             │ user_id = ?                 │
     │                             ├────────────────────────────>│
     │                             │                             │
     │                             │<────────────────────────────┤
     │<────────────────────────────┤ students                    │
     │ { data: [...] }             │                             │
     │                             │                             │
```

### Security Measures

| Layer                | Measure             | Implementation                           |
| -------------------- | ------------------- | ---------------------------------------- |
| **Transport**        | HTTPS               | SSL/TLS certificate on Render/Vercel     |
| **Authentication**   | JWT                 | jsonwebtoken library, 8-hour expiration  |
| **Password Storage** | Hashing             | bcrypt with salt rounds = 10             |
| **Authorization**    | User-scoped queries | `WHERE user_id = ?` in all queries       |
| **Input Validation** | Middleware          | Validate types, ranges, required fields  |
| **SQL Injection**    | Prepared statements | Parameterized queries (`?` placeholders) |
| **XSS**              | React escaping      | React auto-escapes JSX                   |
| **CORS**             | Whitelist           | Only allow frontend origin               |
| **Rate Limiting**    | (TODO)              | Recommend express-rate-limit             |

---

## Performance Optimizations

### Backend Optimizations

1. **Database Indexing:**
   ```sql
   CREATE INDEX idx_students_user_id ON students(user_id);
   CREATE// filepath: /Users/vishaljha/Desktop/Take Home AI/docs/ARCHITECTURE.md
   ```

# 🏗️ Architecture & Design Decisions

Comprehensive documentation of architectural choices, OOP principles, design patterns, and technical reasoning.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack Reasoning](#technology-stack-reasoning)
3. [OOP Principles Implementation](#oop-principles-implementation)
4. [Design Patterns](#design-patterns)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Security Architecture](#security-architecture)
8. [Performance Optimizations](#performance-optimizations)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Frontend (TypeScript)                          │  │
│  │  - Components (UI)                                    │  │
│  │  - State Management (useState, useEffect)            │  │
│  │  - API Client (Axios)                                │  │
│  │  - Routing (React Router)                            │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/JSON
                       │ JWT Token in Header
┌──────────────────────▼──────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                    │  │
│  │  - CORS Middleware                                    │  │
│  │  - JWT Authentication Middleware                      │  │
│  │  - Request Validation Middleware                      │  │
│  │  - Error Handling Middleware                          │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │ Controllers │  │  Services   │  │  Validators  │        │
│  │ (Routes)    │──│  (Logic)    │──│  (Rules)     │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                       DATA ACCESS LAYER                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Models (ORM-like)                                    │  │
│  │  - Student Model                                      │  │
│  │  - User Model                                         │  │
│  │  - Database Helper (SQLite wrapper)                  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      PERSISTENCE LAYER                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SQLite Database (data.sqlite)                        │  │
│  │  - users table                                        │  │
│  │  - students table                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Style

**Chosen:** **Layered (N-Tier) Architecture** with **RESTful API** design

**Reasons:**

1. **Separation of Concerns:** Each layer has a specific responsibility
2. **Testability:** Layers can be tested independently
3. **Maintainability:** Changes in one layer don't affect others
4. **Scalability:** Layers can be scaled independently
5. **Industry Standard:** Well-understood pattern with extensive documentation

**Benefits:**

- ✅ Clear boundaries between presentation, business logic, and data
- ✅ Easy to add new features without breaking existing code
- ✅ Supports multiple clients (web, mobile) using the same API
- ✅ Enables parallel development (frontend/backend teams)

---

## Technology Stack Reasoning

### Backend: Express.js + SQLite

#### Why Express.js?

| Factor          | Reason                                                   |
| --------------- | -------------------------------------------------------- |
| **Maturity**    | Battle-tested framework with 10+ years of production use |
| **Ecosystem**   | Massive npm ecosystem (400,000+ packages)                |
| **Performance** | Non-blocking I/O, handles 10,000+ req/sec easily         |
| **Simplicity**  | Minimal boilerplate, quick to set up                     |
| **Flexibility** | No opinionated structure, choose your own patterns       |
| **Community**   | Large community, extensive documentation                 |

**Alternatives Considered:**

- **Django (Python):** Rejected due to heavier runtime, slower for small projects
- **Spring Boot (Java):** Rejected due to verbose syntax, longer dev time
- **FastAPI (Python):** Rejected due to less mature ecosystem
- **NestJS (Node):** Rejected due to complexity overkill for this project size

#### Why SQLite?

| Factor                 | Reason                                           |
| ---------------------- | ------------------------------------------------ |
| **Zero Configuration** | No separate database server needed               |
| **Portability**        | Single file database, easy to backup/move        |
| **Performance**        | Faster than client-server DBs for < 100K records |
| **Reliability**        | ACID compliant, used in billions of devices      |
| **Development Speed**  | No network latency, instant queries              |

**Production Readiness:**

- ✅ Handles 100,000+ queries/sec
- ✅ Supports up to 281 TB database size
- ✅ Used by Apple, Google, Microsoft in production
- ⚠️ **Limitation:** Single-writer (fine for < 100 concurrent writes/sec)

**When to Migrate to PostgreSQL:**

- User base > 10,000 concurrent users
- Multiple app servers (horizontal scaling)
- Need for advanced features (full-text search, JSON queries)

### Frontend: React + Vite + TypeScript

#### Why React?

| Factor                    | Reason                                                |
| ------------------------- | ----------------------------------------------------- |
| **Component Reusability** | Build once, use everywhere                            |
| **Virtual DOM**           | Efficient updates, smooth UI                          |
| **Ecosystem**             | Largest library ecosystem (shadcn/ui, Recharts, etc.) |
| **Developer Experience**  | Fast refresh, great dev tools                         |
| **Hiring Pool**           | Largest pool of frontend developers                   |

**Alternatives Considered:**

- **Vue.js:** Rejected due to smaller ecosystem
- **Angular:** Rejected due to steep learning curve, verbosity
- **Svelte:** Rejected due to smaller community, fewer libraries

#### Why Vite?

| Factor         | Reason                                              |
| -------------- | --------------------------------------------------- |
| **Speed**      | 10-100x faster than Webpack (cold start < 1 second) |
| **Modern**     | Native ESM, no bundling in dev                      |
| **HMR**        | Instant hot module replacement                      |
| **Build Size** | Optimized production builds (Rollup-based)          |

**vs Webpack:**

- Development server startup: **0.8s (Vite)** vs **15s (Webpack)**
- Hot reload: **< 50ms (Vite)** vs **500ms+ (Webpack)**

#### Why TypeScript?

| Factor              | Benefit                                   |
| ------------------- | ----------------------------------------- |
| **Type Safety**     | Catch errors at compile time, not runtime |
| **IntelliSense**    | Auto-complete, refactoring support        |
| **Documentation**   | Types serve as inline documentation       |
| **Maintainability** | Easier to refactor large codebases        |

**Developer Productivity:**

- 15% fewer bugs in production (Microsoft study)
- 20% faster development with large teams
- Better IDE support (VS Code, WebStorm)

---

## OOP Principles Implementation

### 1. Encapsulation

**Definition:** Bundling data and methods that operate on data within a single unit (class), hiding internal state.

#### Backend Example: Student Model

```javascript
// filepath: backend/src/models/Student.js
class Student {
  constructor(data) {
    // Private-like properties (convention: prefix with _)
    this._id = data.id;
    this._name = data.name;
    this._status = data.status;
    this._attendancePercentage = data.attendancePercentage;
    this._assignmentScore = data.assignmentScore;

    // Encapsulated: GPA is calculated, not stored
    this._gpa = this.calculateGPA();
  }

  // Public getter methods (read-only access)
  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get gpa() {
    return this._gpa;
  }

  // Private method (encapsulated business logic)
  calculateGPA() {
    return (
      (this._attendancePercentage * 0.4 + this._assignmentScore * 0.6) / 10
    );
  }

  // Public method with validation
  updateScores(attendance, assignment) {
    if (attendance < 0 || attendance > 100) {
      throw new Error("Attendance must be 0-100");
    }
    if (assignment < 0 || assignment > 100) {
      throw new Error("Assignment score must be 0-100");
    }
    this._attendancePercentage = attendance;
    this._assignmentScore = assignment;
    this._gpa = this.calculateGPA(); // Recalculate GPA
  }

  // Convert to database format (hides internal representation)
  toDbObject() {
    return {
      id: this._id,
      name: this._name,
      status: this._status,
      attendance_percentage: this._attendancePercentage,
      assignment_score: this._assignmentScore,
      grade_point_average: this._gpa,
    };
  }
}

module.exports = Student;
```

**Benefits:**

- ✅ GPA calculation logic hidden from external code
- ✅ Validation enforced in one place
- ✅ Internal data format (camelCase) vs DB format (snake_case) abstracted
- ✅ Changes to GPA formula only require updating one method

#### Frontend Example: API Client

```typescript
// filepath: frontend/src/utils/api.ts
class ApiClient {
  private baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({ baseURL });

    // Encapsulated: auto-attach token to requests
    this.axiosInstance.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Private helper (hidden from external code)
  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  // Public interface (abstracts HTTP details)
  async getStudents(params?: StudentQueryParams): Promise<Student[]> {
    const response = await this.axiosInstance.get("/students", { params });
    return response.data.data;
  }

  async createStudent(data: CreateStudentDTO): Promise<Student> {
    const response = await this.axiosInstance.post("/students", data);
    return response.data.data;
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);
```

**Benefits:**

- ✅ Token management hidden from components
- ✅ HTTP implementation details abstracted
- ✅ Easy to switch from axios to fetch without changing components

---

### 2. Abstraction

**Definition:** Hiding complex implementation details, exposing only essential features.

#### Backend Example: Database Service

```javascript
// filepath: backend/src/services/StudentService.js
class StudentService {
  constructor(db) {
    this.db = db; // Database abstraction
  }

  // Abstract interface: user doesn't know about SQL
  async findAll(userId, filters = {}) {
    // Complex SQL query abstracted away
    const { status, page = 1, limit = 10, search } = filters;
    let query = "SELECT * FROM students WHERE user_id = ?";
    const params = [userId];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    if (search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    return this.db.all(query, params);
  }

  async create(studentData, userId) {
    const student = new Student({ ...studentData, userId });

    // Abstract: user doesn't know about GPA calculation
    const dbData = student.toDbObject();

    const result = await this.db.run(
      `INSERT INTO students (...) VALUES (?, ?, ?, ...)`,
      Object.values(dbData)
    );

    return { ...dbData, id: result.lastID };
  }
}

module.exports = StudentService;
```

**Benefits:**

- ✅ Controllers don't know about SQL syntax
- ✅ Business logic separated from data access
- ✅ Easy to swap SQLite for PostgreSQL later

#### Frontend Example: Student Hook

```typescript
// filepath: frontend/src/hooks/useStudents.ts
function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Abstract: component doesn't handle API calls
  const fetchStudents = async (filters?: StudentFilters) => {
    setLoading(true);
    try {
      const data = await apiClient.getStudents(filters);
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (data: CreateStudentDTO) => {
    const newStudent = await apiClient.createStudent(data);
    setStudents((prev) => [newStudent, ...prev]);
  };

  return { students, loading, error, fetchStudents, createStudent };
}
```

**Benefits:**

- ✅ Components don't handle loading/error states
- ✅ API call logic reusable across components
- ✅ Easier to test (mock the hook)

---

### 3. Inheritance

**Definition:** Creating new classes from existing ones, inheriting properties and methods.

#### Backend Example: Base Controller

```javascript
// filepath: backend/src/controllers/BaseController.js
class BaseController {
  // Common error handling for all controllers
  handleError(res, error, statusCode = 500) {
    console.error(error);
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }

  // Common success response
  sendSuccess(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  // Common validation
  validateRequired(fields, body) {
    const missing = fields.filter((field) => !body[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  }
}

// filepath: backend/src/controllers/StudentController.js
class StudentController extends BaseController {
  constructor(studentService) {
    super(); // Call parent constructor
    this.studentService = studentService;
  }

  async create(req, res) {
    try {
      // Use inherited validation method
      this.validateRequired(
        ["name", "status", "attendancePercentage"],
        req.body
      );

      const student = await this.studentService.create(req.body, req.user.id);

      // Use inherited success response
      return this.sendSuccess(res, student, "Student created", 201);
    } catch (error) {
      // Use inherited error handling
      return this.handleError(res, error, 400);
    }
  }
}

module.exports = StudentController;
```

**Benefits:**

- ✅ Eliminates duplicate error handling code
- ✅ Consistent response format across all controllers
- ✅ Easy to add common functionality (logging, metrics)

---

### 4. Polymorphism

**Definition:** Objects of different types can be accessed through the same interface.

#### Backend Example: Service Interface

```javascript
// filepath: backend/src/services/IService.js (interface pattern)
class IService {
  async findAll(userId, filters) {
    throw new Error("Method not implemented");
  }
  async findById(id, userId) {
    throw new Error("Method not implemented");
  }
  async create(data, userId) {
    throw new Error("Method not implemented");
  }
  async update(id, data, userId) {
    throw new Error("Method not implemented");
  }
  async delete(id, userId) {
    throw new Error("Method not implemented");
  }
}

// filepath: backend/src/services/StudentService.js
class StudentService extends IService {
  // Implement all methods...
  async findAll(userId, filters) {
    /* implementation */
  }
  // ...
}

// filepath: backend/src/services/TeacherService.js (hypothetical)
class TeacherService extends IService {
  // Different implementation, same interface
  async findAll(userId, filters) {
    /* different logic */
  }
  // ...
}

// filepath: backend/src/controllers/GenericController.js
class GenericController {
  constructor(service) {
    this.service = service; // Can be StudentService or TeacherService
  }

  async getAll(req, res) {
    // Same code works for both services (polymorphism)
    const data = await this.service.findAll(req.user.id, req.query);
    return res.json({ success: true, data });
  }
}
```

**Benefits:**

- ✅ Add new entity types (Teacher, Course) without changing controller
- ✅ Same CRUD logic for all entities
- ✅ Easier to test (mock the service interface)

#### Frontend Example: Form Components

```typescript
// Base form props interface
interface BaseFormProps<T> {
  onSubmit: (data: T) => Promise<void>;
  onCancel: () => void;
  initialData?: T;
}

// Student form
function StudentForm({ onSubmit, onCancel, initialData }: BaseFormProps<StudentDTO>) {
  // Implementation specific to students
}

// Teacher form (hypothetical)
function TeacherForm({ onSubmit, onCancel, initialData }: BaseFormProps<TeacherDTO>) {
  // Different implementation, same interface
}

// Modal wrapper (polymorphic usage)
function FormModal<T>({ FormComponent, ...props }: { FormComponent: React.FC<BaseFormProps<T>> } & BaseFormProps<T>) {
  return (
    <Dialog>
      <FormComponent {...props} />
    </Dialog>
  );
}

// Usage:
<FormModal FormComponent={StudentForm} onSubmit={handleSubmitStudent} />
<FormModal FormComponent={TeacherForm} onSubmit={handleSubmitTeacher} />
```

**Benefits:**

- ✅ Reusable modal logic
- ✅ Type-safe forms
- ✅ Easy to add new form types

---

### 5. SOLID Principles

#### S - Single Responsibility Principle

**"A class should have one, and only one, reason to change."**

**Example:**

```javascript
// ❌ BAD: StudentController does too much
class StudentController {
  async create(req, res) {
    // Validation
    if (!req.body.name) return res.status(400).json({ error: "Name required" });

    // Business logic
    const gpa = (req.body.attendance * 0.4 + req.body.assignment * 0.6) / 10;

    // Database access
    const result = db.run("INSERT INTO students...", [req.body.name, gpa]);

    // Response formatting
    return res.json({ success: true, data: { id: result.lastID } });
  }
}

// ✅ GOOD: Separated responsibilities
class StudentValidator {
  validate(data) {
    if (!data.name) throw new Error("Name required");
    // ...
  }
}

class StudentService {
  create(data) {
    const student = new Student(data); // Business logic (GPA calc)
    return this.repository.save(student);
  }
}

class StudentController {
  async create(req, res) {
    try {
      this.validator.validate(req.body);
      const student = await this.service.create(req.body);
      return res.json({ success: true, data: student });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
```

#### O - Open/Closed Principle

**"Software entities should be open for extension, but closed for modification."**

**Example:**

```javascript
// ✅ GOOD: Extend without modifying
class BaseValidator {
  validate(data) {
    // Common validation
  }
}

class StudentValidator extends BaseValidator {
  validate(data) {
    super.validate(data); // Reuse base validation
    // Add student-specific validation
    if (data.attendancePercentage < 0 || data.attendancePercentage > 100) {
      throw new Error("Invalid attendance percentage");
    }
  }
}

class TeacherValidator extends BaseValidator {
  validate(data) {
    super.validate(data);
    // Add teacher-specific validation
    if (!data.department) {
      throw new Error("Department is required for teachers");
    }
  }
}
```

#### L - Liskov Substitution Principle

**"Objects should be replaceable with instances of their subtypes without altering correctness."**

**Example:**

```javascript
// Base class contract
class Repository {
  async save(entity) {
    // Must return the saved entity with an ID
    throw new Error("Not implemented");
  }
}

// Subclass respects contract
class SQLiteRepository extends Repository {
  async save(entity) {
    const result = await this.db.run("INSERT...", entity.toDbObject());
    return { ...entity, id: result.lastID }; // Returns entity with ID
  }
}

class PostgreSQLRepository extends Repository {
  async save(entity) {
    const result = await this.pool.query(
      "INSERT... RETURNING *",
      entity.toDbObject()
    );
    return result.rows[0]; // Returns entity with ID
  }
}

// Service works with any repository (Liskov substitution)
class StudentService {
  constructor(repository) {
    this.repository = repository; // Can be SQLite or PostgreSQL
  }

  async create(data) {
    const student = new Student(data);
    return this.repository.save(student); // Works with both
  }
}
```

#### I - Interface Segregation Principle

**"Clients should not be forced to depend on interfaces they don't use."**

**Example:**

```javascript
// ❌ BAD: Fat interface
interface IStudentService {
  findAll(): Promise<Student[]>;
  findById(id: number): Promise<Student>;
  create(data: StudentDTO): Promise<Student>;
  update(id: number, data: StudentDTO): Promise<Student>;
  delete(id: number): Promise<void>;
  exportToCSV(): Promise<string>;
  sendEmailNotification(id: number): Promise<void>;
  generateReport(): Promise<Buffer>;
}

// ✅ GOOD: Segregated interfaces
interface IStudentReader {
  findAll(): Promise<Student[]>;
  findById(id: number): Promise<Student>;
}

interface IStudentWriter {
  create(data: StudentDTO): Promise<Student>;
  update(id: number, data: StudentDTO): Promise<Student>;
  delete(id: number): Promise<void>;
}

interface IStudentExporter {
  exportToCSV(): Promise<string>;
}

interface IStudentNotifier {
  sendEmailNotification(id: number): Promise<void>;
}

// Implement only what you need
class StudentService implements IStudentReader, IStudentWriter {
  // Only implements CRUD methods
}

class StudentReportService implements IStudentExporter {
  // Only implements export
}
```

#### D - Dependency Inversion Principle

**"Depend on abstractions, not concretions."**

**Example:**

```javascript
// ❌ BAD: Direct dependency on SQLite
class StudentService {
  constructor() {
    this.db = new SQLiteDatabase("data.sqlite"); // Tight coupling
  }
}

// ✅ GOOD: Depend on abstraction
interface IDatabase {
  run(sql: string, params: any[]): Promise<{ lastID: number }>;
  get(sql: string, params: any[]): Promise<any>;
  all(sql: string, params: any[]): Promise<any[]>;
}

class SQLiteDatabase implements IDatabase {
  run(sql, params) {
    /* SQLite implementation */
  }
  get(sql, params) {
    /* SQLite implementation */
  }
  all(sql, params) {
    /* SQLite implementation */
  }
}

class StudentService {
  constructor(database: IDatabase) {
    this.db = database; // Depends on interface, not implementation
  }
}

// Can inject any database implementation
const sqliteDb = new SQLiteDatabase("data.sqlite");
const studentService = new StudentService(sqliteDb);

// Easy to swap for PostgreSQL later
const postgresDb = new PostgreSQLDatabase(connectionString);
const studentService2 = new StudentService(postgresDb);

// Easy to mock for testing
const mockDb = new MockDatabase();
const studentServiceForTesting = new StudentService(mockDb);
```

---

## Design Patterns

### 1. Repository Pattern

**Purpose:** Abstract data access logic, provide a collection-like interface.

**Implementation:**

```javascript
// filepath: backend/src/repositories/StudentRepository.js
class StudentRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll(filters = {}) {
    const { userId, status, page = 1, limit = 10 } = filters;
    let sql = "SELECT * FROM students WHERE user_id = ?";
    const params = [userId];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    const rows = await this.db.all(sql, params);
    return rows.map((row) => this.mapToEntity(row));
  }

  async findById(id, userId) {
    const row = await this.db.get(
      "SELECT * FROM students WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return row ? this.mapToEntity(row) : null;
  }

  async save(student) {
    if (student.id) {
      return this.update(student);
    } else {
      return this.insert(student);
    }
  }

  async insert(student) {
    const data = student.toDbObject();
    const result = await this.db.run(
      `INSERT INTO students (user_id, name, status, ...) VALUES (?, ?, ?, ...)`,
      Object.values(data)
    );
    return this.findById(result.lastID, student.userId);
  }

  async update(student) {
    const data = student.toDbObject();
    await this.db.run(
      `UPDATE students SET name = ?, status = ?, ... WHERE id = ? AND user_id = ?`,
      [...Object.values(data), student.id, student.userId]
    );
    return this.findById(student.id, student.userId);
  }

  async delete(id, userId) {
    await this.db.run("DELETE FROM students WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);
  }

  // Map database row to domain entity
  mapToEntity(row) {
    return new Student({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      status: row.status,
      isScholarship: Boolean(row.is_scholarship),
      attendancePercentage: row.attendance_percentage,
      assignmentScore: row.assignment_score,
      gradePointAverage: row.grade_point_average,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

module.exports = StudentRepository;
```

**Benefits:**

- ✅ Service layer doesn't know about SQL
- ✅ Easy to swap databases
- ✅ Centralized mapping logic
- ✅ Testable (mock repository)

---

### 2. Service Layer Pattern

**Purpose:** Encapsulate business logic, coordinate between repositories and controllers.

**Implementation:**

```javascript
// filepath: backend/src/services/StudentService.js
class StudentService {
  constructor(studentRepository, userRepository) {
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
  }

  async createStudent(data, userId) {
    // Business rule: check user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Business rule: validate data
    this.validateStudentData(data);

    // Create domain entity (encapsulates GPA calculation)
    const student = new Student({ ...data, userId });

    // Save via repository
    return this.studentRepository.save(student);
  }

  async updateStudent(id, data, userId) {
    // Business rule: student must exist and belong to user
    const existing = await this.studentRepository.findById(id, userId);
    if (!existing) {
      throw new Error("Student not found or access denied");
    }

    // Business rule: validate updates
    this.validateStudentData(data, true);

    // Update entity (GPA recalculated if scores changed)
    existing.update(data);

    return this.studentRepository.save(existing);
  }

  async getStatistics(userId) {
    const students = await this.studentRepository.findAll({ userId });

    // Business logic: calculate stats
    return {
      total: students.length,
      active: students.filter((s) => s.status === "active").length,
      withScholarship: students.filter((s) => s.isScholarship).length,
      averageGPA:
        students.reduce((sum, s) => sum + s.gpa, 0) / students.length || 0,
    };
  }

  validateStudentData(data, isUpdate = false) {
    // Business rules
    if (!isUpdate && !data.name) {
      throw new Error("Name is required");
    }
    if (data.attendancePercentage < 0 || data.attendancePercentage > 100) {
      throw new Error("Attendance must be between 0 and 100");
    }
    // ...
  }
}

module.exports = StudentService;
```

**Benefits:**

- ✅ Business logic separated from data access
- ✅ Reusable across controllers (REST API, GraphQL, CLI)
- ✅ Easy to test (mock repositories)
- ✅ Single place for business rules

---

### 3. Middleware Pattern

**Purpose:** Process requests in a pipeline before reaching controllers.

**Implementation:**

```javascript
// filepath: backend/src/middleware/auth.js
function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user to request
    next(); // Continue to next middleware/controller
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// filepath: backend/src/middleware/validate.js
function validateStudent(req, res, next) {
  const { name, status, attendancePercentage, assignmentScore } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  if (!["active", "inactive", "graduated"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  if (attendancePercentage < 0 || attendancePercentage > 100) {
    return res.status(400).json({ error: "Attendance must be 0-100" });
  }

  if (assignmentScore < 0 || assignmentScore > 100) {
    return res.status(400).json({ error: "Assignment score must be 0-100" });
  }

  next(); // Validation passed
}

// filepath: backend/src/routes/students.js
router.post(
  "/students",
  authenticate,
  validateStudent,
  studentController.create
);
//                        ^^^^^^^^^^^  ^^^^^^^^^^^^^^  Request flows through middlewares
```

**Benefits:**

- ✅ Reusable validation logic
- ✅ Separation of concerns (auth, validation, logging)
- ✅ Easy to add/remove middleware
- ✅ Clean controller code

---

### 4. Factory Pattern

**Purpose:** Create objects without specifying exact class.

**Implementation:**

```javascript
// filepath: backend/src/factories/ResponseFactory.js
class ResponseFactory {
  static success(data, message = "Success", statusCode = 200) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(error, statusCode = 500) {
    return {
      success: false,
      error: error.message || "Internal server error",
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(errors) {
    return {
      success: false,
      error: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static paginatedResponse(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Usage in controller
class StudentController {
  async getAll(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const students = await this.service.findAll(req.user.id, req.query);
    const total = await this.service.count(req.user.id);

    return res.json(
      ResponseFactory.paginatedResponse(students, page, limit, total)
    );
  }

  async create(req, res) {
    try {
      const student = await this.service.create(req.body, req.user.id);
      return res
        .status(201)
        .json(ResponseFactory.success(student, "Student created", 201));
    } catch (error) {
      return res.status(400).json(ResponseFactory.error(error, 400));
    }
  }
}
```

**Benefits:**

- ✅ Consistent response format
- ✅ Easy to change response structure globally
- ✅ Self-documenting (clear intent)

---

### 5. Singleton Pattern

**Purpose:** Ensure only one instance of a class exists.

**Implementation:**

```javascript
// filepath: backend/db.js
const Database = require("better-sqlite3");

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance; // Return existing instance
    }

    this.db = new Database("data.sqlite");
    this.db.pragma("journal_mode = WAL"); // Performance optimization

    DatabaseConnection.instance = this;
  }

  run(sql, params = []) {
    return this.db.prepare(sql).run(params);
  }

  get(sql, params = []) {
    return this.db.prepare(sql).get(params);
  }

  all(sql, params = []) {
    return this.db.prepare(sql).all(params);
  }

  close() {
    this.db.close();
    DatabaseConnection.instance = null;
  }
}

// Export single instance
module.exports = new DatabaseConnection();
```

**Benefits:**

- ✅ Only one database connection
- ✅ Connection reused across entire app
- ✅ Prevents connection leaks

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── controllers/           # HTTP request handlers
│   │   ├── BaseController.js  # Abstract base class
│   │   ├── AuthController.js  # Signup, login
│   │   └── StudentController.js  # Student CRUD
│   │
│   ├── services/              # Business logic
│   │   ├── AuthService.js     # JWT generation, password hashing
│   │   └── StudentService.js  # Student business rules
│   │
│   ├── repositories/          # Data access
│   │   ├── UserRepository.js
│   │   └── StudentRepository.js
│   │
│   ├── models/                # Domain entities
│   │   ├── User.js
│   │   └── Student.js
│   │
│   ├── middleware/            # Request processing pipeline
│   │   ├── auth.js            # JWT verification
│   │   ├── validate.js        # Input validation
│   │   ├── errorHandler.js    # Global error handling
│   │   └── cors.js            # CORS configuration
│   │
│   ├── routes/                # API route definitions
│   │   ├── auth.js            # /auth/signup, /auth/login
│   │   └── students.js        # /api/students/*
│   │
│   ├── utils/                 # Helper functions
│   │   ├── ResponseFactory.js
│   │   └── logger.js
│   │
│   └── config/                # Configuration
│       └── database.js
│
├── tests/                     # Test suite
│   ├── testing.sh             # Bash test runner
│   └── README.md
│
├── db.js                      # Database singleton
├── init-db.js                 # Database initialization script
├── server.js                  # Express app entry point
├── package.json
└── .env                       # Environment variables
```

### Request Flow

```
HTTP Request
    │
    ▼
┌────────────────────────┐
│  Express Middleware    │
│  - CORS                │
│  - Body Parser         │
│  - Logging             │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Authentication        │
│  - JWT verification    │
│  - req.user populated  │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Validation            │
│  - Check required      │
│  - Type checking       │
│  - Range validation    │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Controller            │
│  - Parse request       │
│  - Call service        │
│  - Format response     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Service               │
│  - Business logic      │
│  - Call repository     │
│  - Return data         │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Repository            │
│  - Build SQL query     │
│  - Execute query       │
│  - Map to entity       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Database              │
│  - Execute query       │
│  - Return rows         │
└────────┬───────────────┘
         │
         ▼
    JSON Response
```

---

## Frontend Architecture

### Component Hierarchy

```
App
 │
 ├── AuthProvider (Context)
 │    │
 │    ├── Login Page
 │    │    └── Auth Component
 │    │
 │    └── Dashboard Page
 │         ├── Header
 │         │    ├── Logo
 │         │    ├── SearchBar
 │         │    └── UserMenu
 │         │
 │         ├── StatsCards (4 cards)
 │         │    ├── TotalStudents
 │         │    ├── ActiveStudents
 │         │    ├── Scholarships
 │         │    └── AverageGPA
 │         │
 │         ├── Filters
 │         │    ├── StatusFilter
 │         │    ├── ScholarshipFilter
 │         │    └── SortDropdown
 │         │
 │         ├── StudentsTable
 │         │    ├── TableHeader
 │         │    │    ├── SortableColumn (Name)
 │         │    │    ├── SortableColumn (Email)
 │         │    │    └── ...
 │         │    │
 │         │    └── StudentRow (repeated)
 │         │         ├── NameCell
 │         │         ├── StatusBadge
 │         │         ├── GPAProgress
 │         │         └── ActionButtons
 │         │              ├── EditButton
 │         │              └── DeleteButton
 │         │
 │         ├── Pagination
 │         │    ├── PrevButton
 │         │    ├── PageNumbers
 │         │    └── NextButton
 │         │
 │         └── StudentModal
 │              ├── Form
 │              │    ├── NameInput
 │              │    ├── EmailInput
 │              │    ├── StatusSelect
 │              │    ├── ScholarshipCheckbox
 │              │    ├── AttendanceInput
 │              │    └── AssignmentInput
 │              │
 │              └── FormActions
 │                   ├── SubmitButton
 │                   └── CancelButton
```

### State Management

```typescript
// Global State (Context API)
interface AuthContext {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Local State (useState in Dashboard)
interface DashboardState {
  students: Student[];
  filteredStudents: Student[];
  currentPage: number;
  filters: {
    status: string;
    scholarship: boolean | null;
    search: string;
  };
  sortBy: string;
  sortOrder: "asc" | "desc";
  isModalOpen: boolean;
  editingStudent: Student | null;
  stats: Statistics;
  loading: boolean;
  error: string | null;
}

// Derived State (useMemo)
const paginatedStudents = useMemo(() => {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
}, [filteredStudents, currentPage]);

const totalPages = useMemo(() => {
  return Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
}, [filteredStudents.length]);
```

### Data Flow

```
User Action (e.g., Create Student)
    │
    ▼
Event Handler in Component
    │
    ▼
Validation (client-side)
    │
    ▼
API Call (axios)
    │
    ▼
Backend Processing
    │
    ▼
Response Received
    │
    ▼
Update Local State (setStudents)
    │
    ▼
Re-render Component
    │
    ▼
Show Success Toast
```

---

## Security Architecture

### Authentication Flow

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│ Frontend │                  │ Backend  │                  │ Database │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │                             │                             │
     │ POST /auth/signup           │                             │
     ├────────────────────────────>│                             │
     │ {username, password}        │                             │
     │                             │ hash password (bcrypt)      │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │                             │                             │
     │                             │ INSERT user                 │
     │                             ├────────────────────────────>│
     │                             │                             │
     │                             │<────────────────────────────┤
     │                             │ user created                │
     │<────────────────────────────┤                             │
     │ 201 Created                 │                             │
     │                             │                             │
     │ POST /auth/login            │                             │
     ├────────────────────────────>│                             │
     │ {username, password}        │                             │
     │                             │ SELECT user                 │
     │                             ├────────────────────────────>│
     │                             │                             │
     │                             │<────────────────────────────┤
     │                             │ user record                 │
     │                             │                             │
     │                             │ verify password (bcrypt)    │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │                             │                             │
     │                             │ generate JWT                │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │<────────────────────────────┤                             │
     │ { token: "eyJ..." }         │                             │
     │                             │                             │
     │ save token to localStorage  │                             │
     │────────┐                    │                             │
     │        │                    │                             │
     │<───────┘                    │                             │
     │                             │                             │
     │ GET /api/students           │                             │
     │ Authorization: Bearer token │                             │
     ├────────────────────────────>│                             │
     │                             │ verify JWT                  │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │                             │                             │
     │                             │ extract userId from token   │
     │                             │────────┐                    │
     │                             │        │                    │
     │                             │<───────┘                    │
     │                             │                             │
     │                             │ SELECT students WHERE       │
     │                             │ user_id = ?                 │
     │                             ├────────────────────────────>│
     │                             │                             │
     │                             │<────────────────────────────┤
     │<────────────────────────────┤ students                    │
     │ { data: [...] }             │                             │
     │                             │                             │
```

### Security Measures

| Layer                | Measure             | Implementation                           |
| -------------------- | ------------------- | ---------------------------------------- |
| **Transport**        | HTTPS               | SSL/TLS certificate on Render/Vercel     |
| **Authentication**   | JWT                 | jsonwebtoken library, 8-hour expiration  |
| **Password Storage** | Hashing             | bcrypt with salt rounds = 10             |
| **Authorization**    | User-scoped queries | `WHERE user_id = ?` in all queries       |
| **Input Validation** | Middleware          | Validate types, ranges, required fields  |
| **SQL Injection**    | Prepared statements | Parameterized queries (`?` placeholders) |
| **XSS**              | React escaping      | React auto-escapes JSX                   |
| **CORS**             | Whitelist           | Only allow frontend origin               |
| **Rate Limiting**    | (TODO)              | Recommend express-rate-limit             |
