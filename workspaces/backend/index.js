import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./schemas/user.js"; 

dotenv.config();

const app = express();
const port = 3000;

// Basic server setup
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});