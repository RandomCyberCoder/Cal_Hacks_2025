import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { VapiClient } from "@vapi-ai/server-sdk";
import User from "./models/user.js";
import { authRouter, authenticateToken } from './routes/auth.js';
import { contactsRouter } from './routes/contacts.js';
import { logRouter } from './routes/log.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Vapi client - use environment variable or fallback
const token = process.env.VAPI_API_KEY || "1746f9c6-f86c-4152-ba5c-f11ee0016d6d";

console.log("Vapi API Key loaded:", token ? "✓" : "✗");

const assistantId = process.env.VAPI_ASSISTANT_ID || "6f62f7f1-7df6-4d57-bc30-4fafbf97506c";
const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID || "450135d5-e4e1-4018-9b37-595e5e91dbc0";

console.log("Assistant ID:", assistantId);
console.log("Phone Number ID:", phoneNumberId);
// Middleware
app.use(express.json());

// CORS configuration for React Native app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/auth', authRouter);
app.use('/contacts', contactsRouter);
app.use('/logs', logRouter);

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'This is a protected route',
    user: req.user
  });
});

// Basic server setup
app.get("/", (req, res) => {
  res.send("Vapi Backend Server is running!");
});

// Test endpoint to make a call
app.post("/make-call", authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    console.log("Making call to:", phoneNumber || "+18082061692");

    const vapi = new VapiClient({
      token,
    });

    const call = await vapi.calls.create({
      assistantId,
      phoneNumberId,
      customer: {
        number: phoneNumber || "+18082061692",
      },
    });

    console.log("Call response:", call);
    res.json({
      success: true,
      callId: call.id,
      message: "Call initiated successfully",
    });
  } catch (error) {
    console.error("Error making call:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// Webhook endpoint for Guardian Alert
app.post("/webhook", (req, res) => {
  try {
    console.log("Guardian Alert webhook received:", req.body);

    // Log the alert data
    const alertData = req.body;
    console.log("Alert Type:", alertData.type);
    console.log("Alert Data:", JSON.stringify(alertData, null, 2));

    // Respond to acknowledge receipt
    res.status(200).json({
      success: true,
      message: "Webhook received successfully",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Vapi Backend Server is running on http://localhost:${port}`);
  console.log(`🚀 Also accessible at http://10.40.54.244:${port}`);
  console.log(`📞 Make calls via POST to http://localhost:${port}/make-call`);
});
