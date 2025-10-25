/**
 * Simple A2A-compatible server implementation
 *
 * This server implements the A2A (Agent-to-Agent) protocol without external SDK dependencies.
 * It provides a clean, self-contained implementation that supports:
 *
 * Features:
 * - A2A protocol compliance (Agent Card, Message endpoints, Streaming)
 * - JSON-RPC 2.0 compatible responses
 * - Server-Sent Events (SSE) for streaming
 * - Task lifecycle management (submitted → working → completed)
 * - Error handling with proper A2A error codes
 * - Backward compatibility with REST API
 *
 * A2A Protocol Implementation:
 * - Agent Card: GET /.well-known/agent-card.json
 * - Send Message: POST /a2a/sendMessage
 * - Stream Messages: POST /a2a/sendMessageStream
 */

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const { HederaAgentService } = require("./services/hederaAgent");
import { hederaAgentCard, createHederaAgentCard } from "./agentCard";

export class SimpleA2AServer {
  private app: any;
  private agentService: any;

  constructor() {
    this.app = express();
    this.agentService = new HederaAgentService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get("/health", (req: any, res: any) => {
      const response = {
        status: "OK",
        message: "Hedera Agent API is running",
        a2aEnabled: true,
      };
      res.json(response);
    });

    // A2A Agent Card endpoint
    this.app.get("/.well-known/agent-card.json", async (req: any, res: any) => {
      try {
        const agentCard = await createHederaAgentCard();
        res.json(agentCard);
      } catch (error) {
        console.error("Error generating agent card:", error);
        res.json(hederaAgentCard); // Fallback to static card
      }
    });

    // A2A Protocol endpoints
    this.app.post("/a2a/sendMessage", async (req: any, res: any) => {
      try {
        const { message } = req.body;

        if (!message || !message.parts) {
          return res.status(400).json({
            error: "Invalid message format",
            code: -32602,
          });
        }

        // Extract text from message parts
        const textParts = message.parts.filter(
          (part: any) => part.kind === "text"
        );
        const messageText = textParts.map((part: any) => part.text).join(" ");

        console.log(`[A2A] Processing message: ${messageText}`);

        // Process with Hedera agent
        const result = await this.agentService.processMessage(messageText);

        // Create A2A-compatible response
        const response = {
          jsonrpc: "2.0",
          id: req.body.id || "1",
          result: {
            kind: "message",
            messageId: this.generateUUID(),
            role: "agent",
            parts: [{ kind: "text", text: result.content }],
            contextId: message.contextId || this.generateUUID(),
          },
        };

        res.json(response);
      } catch (error) {
        console.error("A2A Error:", error);
        res.status(500).json({
          jsonrpc: "2.0",
          id: req.body.id || "1",
          error: {
            code: -32603,
            message: "Internal error",
            data: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    });

    // A2A streaming endpoint
    this.app.post("/a2a/sendMessageStream", async (req: any, res: any) => {
      try {
        const { message } = req.body;

        if (!message || !message.parts) {
          return res.status(400).json({
            error: "Invalid message format",
            code: -32602,
          });
        }

        // Set up Server-Sent Events
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Cache-Control",
        });

        // Extract text from message parts
        const textParts = message.parts.filter(
          (part: any) => part.kind === "text"
        );
        const messageText = textParts.map((part: any) => part.text).join(" ");

        console.log(`[A2A Stream] Processing message: ${messageText}`);

        // Send initial task event
        const taskId = this.generateUUID();
        const contextId = message.contextId || this.generateUUID();

        res.write(
          `data: ${JSON.stringify({
            kind: "task",
            id: taskId,
            contextId: contextId,
            status: {
              state: "submitted",
              timestamp: new Date().toISOString(),
            },
            history: [message],
          })}\n\n`
        );

        // Send working status
        res.write(
          `data: ${JSON.stringify({
            kind: "status-update",
            taskId: taskId,
            contextId: contextId,
            status: { state: "working", timestamp: new Date().toISOString() },
            final: false,
          })}\n\n`
        );

        // Process with Hedera agent
        const result = await this.agentService.processMessage(messageText);

        // Send response message
        res.write(
          `data: ${JSON.stringify({
            kind: "message",
            messageId: this.generateUUID(),
            role: "agent",
            parts: [{ kind: "text", text: result.content }],
            contextId: contextId,
          })}\n\n`
        );

        // Send completed status
        res.write(
          `data: ${JSON.stringify({
            kind: "status-update",
            taskId: taskId,
            contextId: contextId,
            status: { state: "completed", timestamp: new Date().toISOString() },
            final: true,
          })}\n\n`
        );

        res.end();
      } catch (error) {
        console.error("A2A Stream Error:", error);
        res.write(
          `data: ${JSON.stringify({
            kind: "status-update",
            taskId: this.generateUUID(),
            contextId: this.generateUUID(),
            status: { state: "failed", timestamp: new Date().toISOString() },
            final: true,
          })}\n\n`
        );
        res.end();
      }
    });

    // Main message endpoint (REST API - keep for backward compatibility)
    this.app.post("/message", async (req: any, res: any) => {
      try {
        const { message } = req.body;

        if (!message) {
          return res.status(400).json({
            error: "Message is required",
          });
        }

        console.log("Processing message:", message);
        const result = await this.agentService.processMessage(message);
        console.log("Response generated successfully");

        const response = {
          response: result.content,
          success: true,
        };
        res.json(response);
      } catch (error) {
        console.error("Error processing message:", error);
        const errorResponse = {
          error: "Error processing message",
          details: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(errorResponse);
      }
    });
  }

  start(port: number = 3000) {
    this.app.listen(port, () => {
      console.log(`🚀 Hedera Agent API server running on port ${port}`);
      console.log(`📡 Health check: http://localhost:${port}/health`);
      console.log(`💬 Message endpoint: http://localhost:${port}/message`);
      console.log(
        `🤖 A2A Agent Card: http://localhost:${port}/.well-known/agent-card.json`
      );
      console.log(`🔗 A2A Protocol endpoints:`);
      console.log(`   - POST http://localhost:${port}/a2a/sendMessage`);
      console.log(`   - POST http://localhost:${port}/a2a/sendMessageStream`);
    });
  }

  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
