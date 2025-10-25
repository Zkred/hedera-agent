/**
 * Test script for Zomato Food Delivery Agent
 *
 * This script demonstrates the key capabilities of the Zomato agent:
 * - Restaurant discovery
 * - Menu browsing
 * - Order placement
 * - Order tracking
 */

import { HederaAgentService } from "./services/hederaAgent";

async function testZomatoAgent() {
  console.log("🍕 Testing Zomato Food Delivery Agent...\n");

  try {
    const agentService = new HederaAgentService();

    // Test 1: Restaurant Discovery
    console.log("1️⃣ Testing Restaurant Discovery...");
    const discoveryResult = await agentService.processMessage(
      "I'm in New York and looking for Italian restaurants near me. Can you help me find some options?"
    );
    console.log("Discovery Response:", discoveryResult.content);
    console.log("---\n");

    // Test 2: Menu Browsing
    console.log("2️⃣ Testing Menu Browsing...");
    const menuResult = await agentService.processMessage(
      "Can you show me the menu for Pizza Palace? I want to see what pizzas they have."
    );
    console.log("Menu Response:", menuResult.content);
    console.log("---\n");

    // Test 3: Order Placement
    console.log("3️⃣ Testing Order Placement...");
    const orderResult = await agentService.processMessage(
      "I want to order a Margherita Pizza and a Coca Cola from Pizza Palace. My address is 123 Main St, New York, NY 10001. I'll pay with credit card."
    );
    console.log("Order Response:", orderResult.content);
    console.log("---\n");

    // Test 4: Order Tracking
    console.log("4️⃣ Testing Order Tracking...");
    const trackingResult = await agentService.processMessage(
      "Can you check the status of my recent order? I want to know if it's being prepared yet."
    );
    console.log("Tracking Response:", trackingResult.content);
    console.log("---\n");

    // Test 5: General Food Query
    console.log("5️⃣ Testing General Food Query...");
    const generalResult = await agentService.processMessage(
      "What are the best sushi restaurants in New York? I'm looking for something with good ratings and reasonable delivery time."
    );
    console.log("General Response:", generalResult.content);
    console.log("---\n");

    console.log("✅ Zomato Agent testing completed successfully!");
  } catch (error) {
    console.error("❌ Error testing Zomato Agent:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testZomatoAgent();
}

export { testZomatoAgent };
