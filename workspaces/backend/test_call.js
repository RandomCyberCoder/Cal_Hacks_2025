// Simple test script to make a Vapi call
// Run with: node test_call.js

import fetch from "node-fetch";

const makeTestCall = async () => {
  try {
    const response = await fetch("http://localhost:3000/make-call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: "+19167087169", // Valid E.164 format phone number
      }),
    });

    const result = await response.json();
    console.log("📞 Call Result:", result);

    if (result.success) {
      console.log(`✅ Call initiated successfully! Call ID: ${result.callId}`);
    } else {
      console.log("❌ Call failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Error making request:", error.message);
    console.log("💡 Make sure your server is running with: npm run dev");
  }
};

makeTestCall();
