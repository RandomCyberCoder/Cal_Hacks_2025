// Test the VAPI webhook endpoint
import fetch from 'node-fetch';

const testVapiWebhook = async () => {
  try {
    console.log("🧪 Testing VAPI webhook endpoint...");
    
    // Simulate a call completion webhook from VAPI
    const webhookData = {
      type: 'call-end',
      call: {
        id: 'test-call-123',
        transcript: 'Hello, this is a test call transcript. The user said hello and goodbye.',
        customer: {
          number: '+13052408589'
        },
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString()
      }
    };

    console.log("📤 Sending test webhook data...");
    
    const response = await fetch("http://localhost:3000/vapi-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ VAPI Webhook Test Result:", result);
    console.log("🔍 Check your server logs and database for the test transcript!");
    
  } catch (error) {
    console.error("❌ Webhook test error:", error.message);
    console.log("💡 Make sure your backend server is running on port 3000");
  }
};

testVapiWebhook(); 