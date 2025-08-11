const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

exports.signup = async (req, res) => {
  //#swagger.tags=["Authentication"]
  //#swagger.summary="Register new user"
  const { email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role: "customer",
    });

    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  //#swagger.tags=["Authentication"]
  //#swagger.summary="Login and receive a JWT token"
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log('User document found for login:', user); 

    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

exports.refresh = async (req, res) => {
  //#swagger.tags=["Authentication"]
  //#swagger.summary="Refresh and receive a new JWT token"
  try {
    const oldToken = req.headers.authorization?.split(" ")[1];
    if (!oldToken) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(oldToken, JWT_SECRET);
    const newToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: "Token refresh failed" });
  }
};

exports.logout = async (req, res) => {
    //#swagger.tags=["Authentication"]
    //#swagger.summary="Logout user (client should discard token)"
  res.status(200).json({ message: "Logged out successfully (client must discard token)" });
};