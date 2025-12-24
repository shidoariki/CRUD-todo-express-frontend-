const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from ./public
app.use(express.static(path.join(__dirname, "public")));

const dataFile = path.join(__dirname, "data.json");

function readData() {
  const data = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// api routes
app.get("/api/items", (req, res) => {
  const data = readData();
  res.json(data.items);
});

app.post("/api/items", (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Item name is required" });
  }
  const data = readData();
  const maxId = Math.max(...data.items.map((item) => item.id), 0);
  const newId = maxId + 1;
  const newItem = { id: newId, name: name.trim(), completed: false };
  data.items.push(newItem);
  writeData(data);
  res.status(201).json(newItem);
});

app.put("/api/items/:id", (req, res) => {
  const itemId = parseInt(req.params.id);
  const { name, completed } = req.body;
  if (name === undefined && completed === undefined) {
    return res
      .status(400)
      .json({ error: "At least one field (name or completed) is required" });
  }
  const data = readData();
  const item = data.items.find((i) => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  if (name !== undefined) item.name = name.trim();
  if (completed !== undefined) item.completed = completed;
  writeData(data);
  res.json(item);
});

app.delete("/api/items/:id", (req, res) => {
  const itemId = parseInt(req.params.id);
  const data = readData();
  const index = data.items.findIndex((i) => i.id === itemId);
  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }
  const deleted = data.items.splice(index, 1)[0];
  writeData(data);
  res.json({ message: "Item deleted successfully", deleted });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📄 Open frontend at: http://localhost:${PORT}/index.html`);
});
