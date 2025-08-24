// index.js
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/testDB")
  .then(() => console.log("✅ MongoDB Connected via Mongoose!"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number
});

const User = mongoose.model("User", userSchema);

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Express + Mongoose!");
});

app.post("/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send({ message: "User saved!", user });
});

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
