// Test the Guardian Alert webhook directly
// Run with: node test_webhook.js

const testWebhook = async () => {
  try {
    const webhookData = {
      message: {
        function: {
          name: "Guardian_Alert_System",
        },
        conditions: [
          { param: "userSilentTooLong", value: "true", operator: "eq" },
          { param: "userInDistress", value: "true", operator: "eq" },
        ],
      },
      metadata: {
        from: "+19167087169",
      },
    };

    console.log("🧪 Testing Guardian Alert webhook...");
    console.log(
      "📤 Sending webhook data:",
      JSON.stringify(webhookData, null, 2)
    );

    const response = await fetch("http://localhost:3000/webhook", {
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
    console.log("🚨 Guardian Alert Test Result:", result);
  } catch (error) {
    console.error("❌ Webhook test error:", error.message);
    console.log("💡 Make sure your server is running");
  }
};

testWebhook();
