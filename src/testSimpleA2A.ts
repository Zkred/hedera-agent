/**
 * Test suite for Simple A2A integration
 *
 * This test suite validates the A2A (Agent-to-Agent) integration by:
 * - Testing agent card retrieval
 * - Testing message sending and receiving
 * - Testing streaming communication
 * - Validating A2A protocol compliance
 *
 * Run with: npm run a2a:test
 */

import { testSimpleA2AClient, testSimpleA2AStreaming } from "./simpleA2AClient";

async function runSimpleA2ATests() {
  console.log("🚀 Starting Simple A2A Integration Tests for Hedera Agent");
  console.log("=".repeat(60));

  try {
    // Test basic A2A client functionality
    await testSimpleA2AClient();

    console.log("\n" + "=".repeat(60));

    // Test A2A streaming functionality
    await testSimpleA2AStreaming();

    console.log("\n" + "=".repeat(60));
    console.log("🎉 All Simple A2A integration tests passed successfully!");
    console.log("✅ Your Hedera Agent is now A2A compliant!");
    console.log("\n📋 A2A Integration Summary:");
    console.log("   ✅ Agent Card endpoint: /.well-known/agent-card.json");
    console.log("   ✅ A2A Message endpoint: /a2a/sendMessage");
    console.log("   ✅ A2A Streaming endpoint: /a2a/sendMessageStream");
    console.log("   ✅ REST API compatibility maintained");
    console.log("   ✅ Hedera Agent Kit integration working");
  } catch (error) {
    console.error("\n❌ Simple A2A integration tests failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runSimpleA2ATests().catch(console.error);
