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
        // phoneNumber: "+15127689863", // Replace with you
        // r test phone number
        // assistantId: "58790545-e1a7-4e3d-94bc-b39baafd12fe",
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
