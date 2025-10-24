const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const { HederaAgentService } = require("./services/hederaAgent");
import {
  MessageRequest,
  MessageResponse,
  ErrorResponse,
  HealthResponse,
} from "./types";

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hedera Agent API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Message endpoint: http://localhost:${PORT}/message`);
});

export default app;
