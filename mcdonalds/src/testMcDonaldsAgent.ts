/**
 * Test script for McDonald's Agent
 *
 * This script demonstrates the key capabilities of the McDonald's agent:
 * - Combo meal management
 * - Drive-thru slot reservations
 * - Nutritional information
 * - McDelivery rewards
 */

import { McDonaldsAgentService } from "./services/mcDonaldsAgent";

async function testMcDonaldsAgent() {
  console.log("🍟 Testing McDonald's Agent...\n");

  try {
    const agentService = new McDonaldsAgentService();

    // Test 1: Combo Meal Creation
    console.log("1️⃣ Testing Combo Meal Creation...");
    const comboResult = await agentService.processMessage(
      "I want to create a custom combo meal with a Big Mac, medium fries, and a medium drink. Can you help me build this combo and tell me the nutritional information?"
    );
    console.log("Combo Meal Response:", comboResult.content);
    console.log("---\n");

    // Test 2: Drive-Thru Management
    console.log("2️⃣ Testing Drive-Thru Management...");
    const driveThruResult = await agentService.processMessage(
      "I want to reserve a drive-thru slot for pickup. I'm customer 'customer_456' and I'll arrive in 15 minutes. Can you find me an available slot?"
    );
    console.log("Drive-Thru Response:", driveThruResult.content);
    console.log("---\n");

    // Test 3: Nutritional Information
    console.log("3️⃣ Testing Nutritional Information...");
    const nutritionResult = await agentService.processMessage(
      "I'm on a diet and want to know the nutritional information for a Quarter Pounder. Can you tell me the calories, protein, and allergens?"
    );
    console.log("Nutrition Response:", nutritionResult.content);
    console.log("---\n");

    // Test 4: McDelivery Rewards
    console.log("4️⃣ Testing McDelivery Rewards...");
    const rewardsResult = await agentService.processMessage(
      "I'm customer 'customer_789' and I want to check my McDelivery points. I also want to see what rewards I can redeem with my current points."
    );
    console.log("Rewards Response:", rewardsResult.content);
    console.log("---\n");

    // Test 5: General McDonald's Query
    console.log("5️⃣ Testing General McDonald's Query...");
    const generalResult = await agentService.processMessage(
      "What are the healthiest options at McDonald's? I want something under 500 calories that's still filling."
    );
    console.log("General Response:", generalResult.content);
    console.log("---\n");

    console.log("✅ McDonald's Agent testing completed successfully!");
  } catch (error) {
    console.error("❌ Error testing McDonald's Agent:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMcDonaldsAgent();
}

export { testMcDonaldsAgent };
