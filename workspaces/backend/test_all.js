// Test all endpoints of the backend server
// Run with: node test_all.js

const testAllEndpoints = async () => {
  try {
    console.log("🧪 Testing all backend endpoints...\n");

    // Test 1: Root endpoint
    console.log("1. Testing root endpoint (/)...");
    const rootResponse = await fetch("http://localhost:3000/");
    const rootText = await rootResponse.text();
    console.log("✅ Root:", rootText);

    // Test 2: Make call endpoint
    console.log("\n2. Testing make-call endpoint...");
    const callResponse = await fetch("http://localhost:3000/make-call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: "+19167087169",
      }),
    });
    const callResult = await callResponse.json();
    console.log("📞 Call Result:", callResult);

    // Test 3: Webhook endpoint
    console.log("\n3. Testing webhook endpoint...");
    const webhookData = {
      type: "guardian_alert",
      message: {
        function: {
          name: "Guardian_Alert_System",
        },
        conditions: [
          { param: "userInDistress", value: "true", operator: "eq" },
        ],
      },
      metadata: {
        from: "+19167087169",
      },
    };

    const webhookResponse = await fetch("http://localhost:3000/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    });
    const webhookResult = await webhookResponse.json();
    console.log("🚨 Webhook Result:", webhookResult);

    console.log("\n✅ All endpoint tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

testAllEndpoints();
