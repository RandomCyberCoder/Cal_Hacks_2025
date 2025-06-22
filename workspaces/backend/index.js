import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { VapiClient } from "@vapi-ai/server-sdk";
import User from "./models/user.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Vapi client - use environment variable or fallback
const token =
  process.env.VAPI_API_KEY || "1746f9c6-f86c-4152-ba5c-f11ee0016d6d";

console.log("Vapi API Key loaded:", token ? "✓" : "✗");

const assistantId =
  process.env.VAPI_ASSISTANT_ID || "6f62f7f1-7df6-4d57-bc30-4fafbf97506c";
const phoneNumberId =
  process.env.VAPI_PHONE_NUMBER_ID || "450135d5-e4e1-4018-9b37-595e5e91dbc0";

console.log("Assistant ID:", assistantId);
console.log("Phone Number ID:", phoneNumberId);

// Middleware
app.use(express.json());

// Basic server setup
app.get("/", (req, res) => {
  res.send("Vapi Backend Server is running!");
});

// Test endpoint to make a call
app.post("/make-call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number format (E.164)
    const targetNumber = phoneNumber || "+19167087169"; // Default test number

    // Basic validation for E.164 format
    if (!targetNumber.startsWith("+") || targetNumber.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Phone number must be in E.164 format (e.g., +1234567890)",
      });
    }

    console.log("Making call to:", targetNumber);

    const vapi = new VapiClient({
      token,
    });

    const call = await vapi.calls.create({
      assistantId,
      phoneNumberId,
      customer: {
        number: targetNumber,
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

app.listen(port, () => {
  console.log(`🚀 Vapi Backend Server is running on http://localhost:${port}`);
  console.log(`📞 Make calls via POST to http://localhost:${port}/make-call`);
});
