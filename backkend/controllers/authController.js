const authService = require("../services/authService");

class AuthController {
  // Use arrow functions to automatically bind `this`
  signup = async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await authService.signup(username, password);
      res
        .status(201)
        .json({ message: "User created successfully", userId: result.id });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const { username, password } = req.body;
      const token = await authService.login(username, password);
      res.json({ message: "Login successful", token });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  };
}

module.exports = new AuthController();
