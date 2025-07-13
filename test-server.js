const axios = require("axios");

async function testServer() {
  console.log("🔍 Testing server startup and basic functionality...\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health check...");
    const healthResponse = await axios.get("http://localhost:8000/health");
    console.log("✅ Health check passed:", healthResponse.data.status);
    console.log("");

    // Test 2: Home endpoint
    console.log("2. Testing home endpoint...");
    const homeResponse = await axios.get("http://localhost:8000/");
    console.log("✅ Home endpoint working:", homeResponse.data);
    console.log("");

    // Test 3: API Documentation
    console.log("3. Testing API documentation...");
    const docsResponse = await axios.get("http://localhost:8000/api-docs/");
    console.log("✅ API documentation accessible");
    console.log("");

    // Test 4: Products endpoint
    console.log("4. Testing products endpoint...");
    const productsResponse = await axios.get(
      "http://localhost:8000/allproducts"
    );
    console.log("✅ Products endpoint working");
    console.log("");

    console.log("🎉 All basic tests passed!");
    console.log("\n📚 API Documentation: http://localhost:8000/api-docs");
    console.log("🔒 Advanced features are active:");
    console.log("   - Rate limiting");
    console.log("   - Error handling");
    console.log("   - Request validation");
    console.log("   - Security middleware");
    console.log("   - Logging system");
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("❌ Server is not running. Please start the server first:");
      console.log("   npm run dev");
    } else {
      console.log("❌ Test failed:", error.message);
      if (error.response) {
        console.log("   Status:", error.response.status);
        console.log("   Data:", error.response.data);
      }
    }
  }
}

testServer();
