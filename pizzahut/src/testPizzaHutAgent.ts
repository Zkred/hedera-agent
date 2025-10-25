/**
 * Test script for Pizza Hut Agent
 *
 * This script demonstrates the key capabilities of the Pizza Hut agent:
 * - Custom pizza creation
 * - Loyalty program management
 * - Promotional code handling
 * - Order tracking
 */

import { PizzaHutAgentService } from "./services/pizzaHutAgent";

async function testPizzaHutAgent() {
  console.log("🍕 Testing Pizza Hut Agent...\n");

  try {
    const agentService = new PizzaHutAgentService();

    // Test 1: Custom Pizza Creation
    console.log("1️⃣ Testing Custom Pizza Creation...");
    const pizzaResult = await agentService.processMessage(
      "I want to create a custom large pizza with thin crust, BBQ sauce, mozzarella cheese, pepperoni, mushrooms, and extra cheese. Can you help me build this pizza?"
    );
    console.log("Pizza Creation Response:", pizzaResult.content);
    console.log("---\n");

    // Test 2: Loyalty Program
    console.log("2️⃣ Testing Loyalty Program...");
    const loyaltyResult = await agentService.processMessage(
      "I'm a customer with ID 'customer_123' and I want to check my loyalty points. I also want to earn points for a 2 HBAR order."
    );
    console.log("Loyalty Response:", loyaltyResult.content);
    console.log("---\n");

    // Test 3: Promotional Codes
    console.log("3️⃣ Testing Promotional Codes...");
    const promoResult = await agentService.processMessage(
      "I have a promo code 'PIZZA20' and my order total is 2.5 HBAR. Can you validate this code and tell me the discount?"
    );
    console.log("Promo Code Response:", promoResult.content);
    console.log("---\n");

    // Test 4: Pizza Sizes and Toppings
    console.log("4️⃣ Testing Pizza Information...");
    const infoResult = await agentService.processMessage(
      "Can you show me all available pizza sizes and vegetarian toppings? I want to create a vegetarian pizza."
    );
    console.log("Pizza Info Response:", infoResult.content);
    console.log("---\n");

    // Test 5: General Pizza Query
    console.log("5️⃣ Testing General Pizza Query...");
    const generalResult = await agentService.processMessage(
      "What are the best pizza combinations for a family of 4? I want something that everyone will like with good value for money."
    );
    console.log("General Response:", generalResult.content);
    console.log("---\n");

    console.log("✅ Pizza Hut Agent testing completed successfully!");
  } catch (error) {
    console.error("❌ Error testing Pizza Hut Agent:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPizzaHutAgent();
}

export { testPizzaHutAgent };
