const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const commentsDir = path.join(__dirname, "..", "comments");
if (!fs.existsSync(commentsDir)) fs.mkdirSync(commentsDir);

router.get("/:projectId", (req, res) => {
  const filePath = path.join(commentsDir, `comments_${req.params.projectId}.txt`);
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") return res.status(500).json({ error: "Failed to read comments" });
    const all = data ? data.trim().split("\n").filter(Boolean) : [];
    const paginated = all.slice((page - 1) * perPage, page * perPage);
    res.json(paginated);
  });
});

router.post("/:projectId", (req, res) => {
  const userId = req.cookies?.user;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  const comment = req.body.text?.trim();
  if (!comment) return res.status(400).json({ error: "Empty comment" });

  const filePath = path.join(commentsDir, `comments_${req.params.projectId}.txt`);
  const fullComment = `[${userId}] ${comment}`;

  fs.appendFile(filePath, fullComment + "\n", (err) => {
    if (err) return res.status(500).json({ error: "Failed to save comment" });
    res.send("OK");
  });
});

module.exports = router;