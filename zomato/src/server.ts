/**
 * Main server file with A2A (Agent-to-Agent) integration
 *
 * This server provides:
 * - REST API endpoints for backward compatibility
 * - A2A protocol endpoints for agent-to-agent communication
 * - Hedera network integration via Hedera Agent Kit
 * - Streaming support for real-time communication
 *
 * Endpoints:
 * - GET  /health - Health check
 * - GET  /.well-known/agent-card.json - A2A agent card
 * - POST /message - REST API message endpoint
 * - POST /a2a/sendMessage - A2A message endpoint
 * - POST /a2a/sendMessageStream - A2A streaming endpoint
 */

const dotenv = require("dotenv");
dotenv.config();

import { SimpleA2AServer } from "./simpleA2AServer";

const PORT = process.env.PORT || 3000;

function startServer() {
  try {
    console.log("🚀 Starting Hedera Agent with A2A Integration...");
    const server = new SimpleA2AServer();
    server.start(parseInt(PORT.toString()));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
