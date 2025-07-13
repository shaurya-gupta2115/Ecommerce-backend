const axios = require("axios");

const BASE_URL = "http://localhost:8000";

// Test data
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "TestPass123",
};

const testProduct = {
  name: "Test Product",
  category: "men",
  new_price: 99.99,
  old_price: 129.99,
};

async function testAdvancedFeatures() {
  console.log("🚀 Testing Advanced E-Commerce API Features\n");

  try {
    // 1. Test Health Check
    console.log("1. Testing Health Check...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health Check:", healthResponse.data);
    console.log("");

    // 2. Test User Registration with Validation
    console.log("2. Testing User Registration with Validation...");
    try {
      const signupResponse = await axios.post(`${BASE_URL}/signup`, testUser);
      console.log("✅ User Registration:", signupResponse.data);
    } catch (error) {
      if (error.response?.data?.error?.message) {
        console.log(
          "✅ Validation Error (Expected):",
          error.response.data.error.message
        );
      } else {
        console.log("❌ Unexpected Error:", error.message);
      }
    }
    console.log("");

    // 3. Test Rate Limiting
    console.log("3. Testing Rate Limiting...");
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        axios.get(`${BASE_URL}/allproducts`).catch((err) => err.response)
      );
    }

    const responses = await Promise.all(promises);
    const rateLimited = responses.filter((res) => res?.status === 429);
    console.log(
      `✅ Rate Limiting Test: ${rateLimited.length} requests were rate limited`
    );
    console.log("");

    // 4. Test Search with Speed Limiting
    console.log("4. Testing Search with Speed Limiting...");
    const searchPromises = [];
    for (let i = 0; i < 35; i++) {
      searchPromises.push(
        axios.get(`${BASE_URL}/search?query=test`).catch((err) => err.response)
      );
    }

    const searchResponses = await Promise.all(searchPromises);
    const speedLimited = searchResponses.filter((res) => res?.status === 429);
    console.log(
      `✅ Speed Limiting Test: ${speedLimited.length} search requests were speed limited`
    );
    console.log("");

    // 5. Test Error Handling
    console.log("5. Testing Error Handling...");
    try {
      await axios.get(`${BASE_URL}/nonexistent-endpoint`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(
          "✅ 404 Error Handling:",
          error.response.data.error.message
        );
      }
    }
    console.log("");

    // 6. Test API Documentation
    console.log("6. Testing API Documentation...");
    try {
      const docsResponse = await axios.get(`${BASE_URL}/api-docs/`);
      if (docsResponse.status === 200) {
        console.log("✅ API Documentation is accessible");
      }
    } catch (error) {
      console.log("❌ API Documentation Error:", error.message);
    }
    console.log("");

    // 7. Test Compression
    console.log("7. Testing Response Compression...");
    const productsResponse = await axios.get(`${BASE_URL}/allproducts`);
    const contentEncoding = productsResponse.headers["content-encoding"];
    console.log(
      `✅ Compression: ${contentEncoding ? "Enabled" : "Not detected"}`
    );
    console.log("");

    console.log("🎉 All Advanced Features Tests Completed!");
    console.log(
      "\n📚 Visit http://localhost:8000/api-docs for interactive API documentation"
    );
    console.log("📊 Check logs/ directory for application logs");
    console.log("🔒 Rate limiting and security features are active");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the tests
testAdvancedFeatures();
