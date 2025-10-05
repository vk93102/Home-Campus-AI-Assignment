const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

class AuthService {
  async signup(username, password) {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // CORRECTED: Uses db.run() for inserting data.
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    const result = await db.run(sql, [username, hashedPassword]);
    return result;
  }

  async login(username, password) {
    // CORRECTED: Uses db.get() for fetching a single row.
    const sql = "SELECT * FROM users WHERE username = ?";
    const user = await db.get(sql, [username]);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    return token;
  }
}

module.exports = new AuthService();
