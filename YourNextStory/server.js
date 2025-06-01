const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/comments", require("./routes/comments"));

app.get("/api/projects", (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, "public", "projects.json"), "utf8");
  res.json(JSON.parse(data));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});