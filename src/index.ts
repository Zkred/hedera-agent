import dotenv from "dotenv";
dotenv.config();

import express from "express";

import {
  MessageRequest,
  MessageResponse,
  ErrorResponse,
  HealthResponse,
} from "./types";

// A2A imports
import { hederaAgentCard } from "./agentCard";
import { HederaAgentService } from "./services/hederaAgent";

// Initialize the agent service
const agentService = new HederaAgentService();

// Express app setup
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (req: any, res: any) => {
  const response: HealthResponse = {
    status: "OK",
    message: "Hedera Agent API is running",
  };
  res.json(response);
});

// A2A Agent Card endpoint
app.get("/.well-known/agent-card.json", (req: any, res: any) => {
  res.json(hederaAgentCard);
});

// Main message endpoint
app.post("/message", async (req: any, res: any) => {
  try {
    const { message }: MessageRequest = req.body;

    if (!message) {
      const errorResponse: ErrorResponse = {
        error: "Message is required",
      };
      return res.status(400).json(errorResponse);
    }

    console.log("Processing message:", message);

    const result = await agentService.processMessage(message);

    console.log("Response generated successfully");
    const response: MessageResponse = {
      response: result.content,
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("Error processing message:", error);
    const errorResponse: ErrorResponse = {
      error: "Error processing message",
      details: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(errorResponse);
  }
});

// Note: A2A routes are handled by the SimpleA2AServer in server.ts

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hedera Agent API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Message endpoint: http://localhost:${PORT}/message`);
  console.log(
    `🤖 A2A Agent Card: http://localhost:${PORT}/.well-known/agent-card.json`
  );
  console.log(
    `🔗 A2A Protocol endpoints available (use server.ts for full A2A support)`
  );
});

export default app;
