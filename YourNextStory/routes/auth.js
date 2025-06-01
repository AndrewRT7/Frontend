const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const router = express.Router();

const prefsDir = path.join(__dirname, "..", "users");

router.get("/current-user", (req, res) => {
  const userId = req.cookies?.user;
  if (!userId) return res.status(401).json({ error: "Not logged in" });
  res.json({ username: userId });
});

if (!fs.existsSync(prefsDir)) fs.mkdirSync(prefsDir);
const saltRounds = 10;

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing credentials" });

  const userFile = path.join(prefsDir, `${username}.json`);
  if (fs.existsSync(userFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(userFile, "utf8"));
      const match = await bcrypt.compare(password, existing.password);
      if (!match) return res.status(403).json({ error: "Invalid password" });

      res.cookie("user", username, { path: "/", httpOnly: true });
      return res.json({ message: "Login successful." });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Server error during login" });
    }
  } else {
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = { username, password: hashedPassword, preferredTags: [], preferredTypes: [], favorites: [] };
      fs.writeFileSync(userFile, JSON.stringify(newUser, null, 2));
      res.cookie("user", username, { path: "/", httpOnly: true });
      res.json({ message: "User registered and logged in." });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ error: "Server error during registration" });
    }
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("user", { path: "/" });
  res.send("Logged out");
});

module.exports = router;