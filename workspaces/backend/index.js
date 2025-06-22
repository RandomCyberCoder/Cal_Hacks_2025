import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { VapiClient } from "@vapi-ai/server-sdk";
import User from "./models/user.js";
import { authRouter, authenticateToken } from './routes/auth.js';


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
app.post("/make-call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const vapi = new VapiClient({
      token,
    });

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Vapi Backend Server is running on http://localhost:${port}`);
  console.log(`🚀 Also accessible at http://10.40.54.244:${port}`);
  console.log(`📞 Make calls via POST to http://localhost:${port}/make-call`);
});
