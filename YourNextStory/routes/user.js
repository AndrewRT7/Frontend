const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const prefsDir = path.join(__dirname, "..", "users");

router.get("/users", (req, res) => {
  const userId = req.cookies?.user;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  const filePath = path.join(prefsDir, `${userId}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "User not found" });

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  res.json({ preferredTags: data.preferredTags, preferredTypes: data.preferredTypes });
});

router.post("/users", (req, res) => {
  const userId = req.cookies?.user;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  const filePath = path.join(prefsDir, `${userId}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "User not found" });

  const userData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  userData.preferredTags = req.body.preferredTags || userData.preferredTags;
  userData.preferredTypes = req.body.preferredTypes || userData.preferredTypes;

  fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
  res.send("Preferences saved");
});

router.get("/library", (req, res) => {
  const username = req.cookies?.user;
  if (!username) return res.status(401).json({ error: "Not logged in" });

  const userFile = path.join(prefsDir, `${username}.json`);
  if (!fs.existsSync(userFile)) return res.status(404).json({ error: "User not found" });

  const userData = JSON.parse(fs.readFileSync(userFile, "utf8"));
  res.json({ favorites: userData.favorites || [] });
});

router.post("/library", (req, res) => {
  const username = req.cookies?.user;
  if (!username) return res.status(401).json({ error: "Not logged in" });

  const userFile = path.join(prefsDir, `${username}.json`);
  if (!fs.existsSync(userFile)) return res.status(404).json({ error: "User not found" });

  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ error: "Project ID is required" });

  const userData = JSON.parse(fs.readFileSync(userFile, "utf8"));
  userData.favorites = userData.favorites || [];
  if (userData.favorites.includes(projectId)) return res.status(400).json({ error: "Already in library" });

  userData.favorites.push(projectId);
  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
  res.json({ message: "Project added to your library" });
});

router.get("/current-user", (req, res) => {
  const userId = req.cookies?.user;
  if (!userId) return res.status(401).json({ error: "Not logged in" });
  res.json({ username: userId });
});

module.exports = router;