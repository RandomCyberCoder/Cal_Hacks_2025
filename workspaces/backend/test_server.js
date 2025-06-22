// Minimal test server to check webhook
import express from "express";

const app = express();
const port = 3001; // Use different port

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Test server running!");
});

app.post("/webhook", (req, res) => {
  console.log("🔔 Webhook received:", req.body);
  res.json({ message: "Webhook test successful!" });
});

app.listen(port, () => {
  console.log(`🧪 Test server running on http://localhost:${port}`);
});
