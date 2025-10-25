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

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { HederaAgentService } from "./services/hederaAgent";
import { hederaAgentCard, createHederaAgentCard } from "./agentCard";
import { zkredAgentIdPlugin } from "@zkred/hedera-agentid-plugin";

export class SimpleA2AServer {
  private app: any;
  private agentService: any;
  private sessions: Map<string, any> = new Map();

  constructor() {
    this.app = express();
    this.agentService = new HederaAgentService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // CORS configuration
    this.app.use(
      cors({
        origin: [
          "http://localhost:5173", // React UI
          "http://localhost:3000", // Alternative React port
          "http://localhost:3001", // Alternative React port
          "http://127.0.0.1:5173",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Agent-DID",
          "X-Session-ID",
          "X-Requested-With",
          "Accept",
          "Origin",
        ],
      })
    );

    // Handle preflight requests
    this.app.options("*", (req: any, res: any) => {
      res.status(200).end();
    });

    this.app.use(express.json());
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get("/health", (req: any, res: any) => {
      const response = {
        status: "OK",
        message: "Zomato Food Delivery Agent API is running",
        a2aEnabled: true,
        capabilities: [
          "restaurant-discovery",
          "menu-browsing",
          "order-placement",
          "order-tracking",
          "hedera-operations",
        ],
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

    // Handshake initiation endpoint for Zomato agent
    this.app.post("/initiateHandshake", async (req: any, res: any) => {
      console.log("🤝 Handshake endpoint accessed - initiating handshakes...");
      try {
        const { mcdonaldsDid, pizzahutDid } = req.body;

        if (!mcdonaldsDid || !pizzahutDid) {
          return res.status(400).json({ error: "Missing required DIDs" });
        }

        // Get the plugin tools
        const tools = zkredAgentIdPlugin.tools({});
        const initiateHandshakeTool = tools.find(
          (tool: any) => tool.method === "initiate_agent_handshake"
        );
        const completeHandshakeTool = tools.find(
          (tool: any) => tool.method === "complete_agent_handshake"
        );

        if (!initiateHandshakeTool || !completeHandshakeTool) {
          throw new Error("Handshake tools not found");
        }

        // Get Zomato's DID and private key from environment
        const zomatoDid = process.env.ZOMATO_DID;
        const zomatoPrivateKey = process.env.ZOMATO_PRIVATE_KEY;
        const zomatoChainId = 296;

        if (!zomatoDid || !zomatoPrivateKey) {
          return res
            .status(500)
            .json({ error: "Zomato credentials not configured" });
        }

        const results = [];

        // Initiate handshake with McDonald's
        console.log(
          `🤝 Initiating handshake with McDonald's (DID: ${mcdonaldsDid})...`
        );
        try {
          const mcdonaldsHandshake = await initiateHandshakeTool.execute(
            null, // client
            {}, // context
            {
              initiatorDid: zomatoDid,
              initiatorChainId: zomatoChainId,
              receiverDid: mcdonaldsDid,
              receiverChainId: 296,
            }
          );

          if (mcdonaldsHandshake.success) {
            const mcdonaldsComplete = await completeHandshakeTool.execute(
              null, // client
              {}, // context
              {
                privateKey: zomatoPrivateKey,
                sessionId:
                  mcdonaldsHandshake.data.handshake.sessionId.toString(),
                receiverAgentCallbackEndPoint:
                  mcdonaldsHandshake.data.handshake
                    .receiverAgentCallbackEndPoint,
                challenge: mcdonaldsHandshake.data.handshake.challenge,
              }
            );

            const mcdonaldsSessionId =
              mcdonaldsHandshake.data.handshake.sessionId;
            const mcdonaldsSuccess =
              mcdonaldsComplete.success &&
              mcdonaldsComplete.data?.handshakeCompleted;

            console.log(
              `🤝 McDonald's handshake completed! Session ID: ${mcdonaldsSessionId}`
            );

            results.push({
              agent: "McDonald's",
              sessionId: mcdonaldsSessionId,
              success: mcdonaldsSuccess,
            });
          }
        } catch (error) {
          console.error("McDonald's handshake failed:", error);
          results.push({
            agent: "McDonald's",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }

        // Initiate handshake with Pizza Hut
        console.log(
          `🤝 Initiating handshake with Pizza Hut (DID: ${pizzahutDid})...`
        );
        try {
          const pizzahutHandshake = await initiateHandshakeTool.execute(
            null, // client
            {}, // context
            {
              initiatorDid: zomatoDid,
              initiatorChainId: zomatoChainId,
              receiverDid: pizzahutDid,
              receiverChainId: 296,
            }
          );

          if (pizzahutHandshake.success) {
            const pizzahutComplete = await completeHandshakeTool.execute(
              null, // client
              {}, // context
              {
                privateKey: zomatoPrivateKey,
                sessionId:
                  pizzahutHandshake.data.handshake.sessionId.toString(),
                receiverAgentCallbackEndPoint:
                  pizzahutHandshake.data.handshake
                    .receiverAgentCallbackEndPoint,
                challenge: pizzahutHandshake.data.handshake.challenge,
              }
            );

            const pizzahutSessionId =
              pizzahutHandshake.data.handshake.sessionId;
            const pizzahutSuccess =
              pizzahutComplete.success &&
              pizzahutComplete.data?.handshakeCompleted;

            console.log(
              `🤝 Pizza Hut handshake completed! Session ID: ${pizzahutSessionId}`
            );

            results.push({
              agent: "Pizza Hut",
              sessionId: pizzahutSessionId,
              success: pizzahutSuccess,
            });
          }
        } catch (error) {
          console.error("Pizza Hut handshake failed:", error);
          results.push({
            agent: "Pizza Hut",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }

        res.json({
          data: {
            results,
            timestamp: Date.now(),
            message:
              "Handshakes completed. Use session IDs in x-session-id header for authenticated communication.",
          },
        });
      } catch (error) {
        console.error("Error in /initiateHandshake:", error);
        res.status(500).json({ error: "Failed to initiate handshakes" });
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
      console.log(
        `🍕 Zomato Food Delivery Agent API server running on port ${port}`
      );
      console.log(`📡 Health check: http://localhost:${port}/health`);
      console.log(`💬 Message endpoint: http://localhost:${port}/message`);
      console.log(
        `🤖 A2A Agent Card: http://localhost:${port}/.well-known/agent-card.json`
      );
      console.log(`🔗 A2A Protocol endpoints:`);
      console.log(`   - POST http://localhost:${port}/a2a/sendMessage`);
      console.log(`   - POST http://localhost:${port}/a2a/sendMessageStream`);
      console.log(`🍽️  Food Delivery Capabilities:`);
      console.log(`   - Restaurant discovery and search`);
      console.log(`   - Menu browsing and item details`);
      console.log(`   - Order placement and tracking`);
      console.log(`   - Secure payments via Hedera blockchain`);
      console.log(`🤝 Handshake Capabilities:`);
      console.log(
        `   - POST http://localhost:${port}/initiateHandshake - Initiate handshakes with other agents`
      );
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
