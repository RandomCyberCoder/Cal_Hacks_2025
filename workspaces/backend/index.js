import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { VapiClient } from "@vapi-ai/server-sdk";
import User from "./schemas/user.js";

dotenv.config();

const app = express();
const port = 3000;

// Initialize Vapi client

const token = "68ee9b0d-2345-46b7-81a9-012e9d52c73c";

console.log("public key", process.env.VAPI_API_KEY);

const assistantId = "58790545-e1a7-4e3d-94bc-b39baafd12fe";
const phoneNumberId = "d9b090b1-c9ff-4274-bc69-22b4935341ec";

console.log("phoneNumberId", phoneNumberId);
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

    const vapi = new VapiClient({
      token,
    });

    console.log;

    const call = await vapi.calls.create({
      assistantId,
      phoneNumberId,
      customer: {
        number: "+18082061692",
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

app.listen(port, () => {
  console.log(`🚀 Vapi Backend Server is running on http://localhost:${port}`);
  console.log(`📞 Make calls via POST to http://localhost:${port}/make-call`);
});
