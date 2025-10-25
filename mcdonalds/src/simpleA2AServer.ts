/**
 * Simple A2A-compatible server implementation for McDonald's Agent
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
import { McDonaldsAgentService } from "./services/mcDonaldsAgent";
import { mcdonaldsAgentCard, createMcDonaldsAgentCard } from "./agentCard";
import { zkredAgentIdPlugin } from "@zkred/hedera-agentid-plugin";

export class SimpleA2AServer {
  private app: any;
  private agentService: any;
  private sessions: Map<string, any> = new Map();

  constructor() {
    this.app = express();
    this.agentService = new McDonaldsAgentService();
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
        message: "McDonald's Agent API is running",
        a2aEnabled: true,
        capabilities: [
          "combo-meals",
          "drive-thru",
          "nutritional-info",
          "mc-delivery-rewards",
          "order-tracking",
          "hedera-operations",
        ],
      };
      res.json(response);
    });

    // A2A Agent Card endpoint
    this.app.get("/.well-known/agent-card.json", async (req: any, res: any) => {
      try {
        const agentCard = await createMcDonaldsAgentCard();
        res.json(agentCard);
      } catch (error) {
        console.error("Error generating McDonald's agent card:", error);
        res.json(mcdonaldsAgentCard); // Fallback to static card
      }
    });

    // A2A Protocol endpoints
    this.app.post("/a2a/sendMessage", async (req: any, res: any) => {
      try {
        // Check for session ID in headers
        const sessionId = req.headers["x-session-id"];
        if (!sessionId) {
          return res.status(401).json({
            error: "Session ID required",
            code: -32601,
            message:
              "Authentication required. Please complete handshake first.",
          });
        }

        // Validate session
        const session = this.sessions.get(sessionId.toString());
        if (!session || !session.verified) {
          return res.status(401).json({
            error: "Invalid or expired session",
            code: -32601,
            message: "Invalid session. Please re-establish handshake.",
          });
        }

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

        console.log(`[A2A] Processing McDonald's message: ${messageText}`);

        // Process with McDonald's agent
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
        // Check for session ID in headers
        const sessionId = req.headers["x-session-id"];
        if (!sessionId) {
          return res.status(401).json({
            error: "Session ID required",
            code: -32601,
            message:
              "Authentication required. Please complete handshake first.",
          });
        }

        // Validate session
        const session = this.sessions.get(sessionId.toString());
        if (!session || !session.verified) {
          return res.status(401).json({
            error: "Invalid or expired session",
            code: -32601,
            message: "Invalid session. Please re-establish handshake.",
          });
        }

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

        console.log(
          `[A2A Stream] Processing McDonald's message: ${messageText}`
        );

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

        // Process with McDonald's agent
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

    // Handshake endpoints
    this.app.post("/initiate", async (req: any, res: any) => {
      try {
        console.log("Received initiate request:", req.body);
        const { sessionId, initiatorDid, initiatorChainId } = req.body;
        console.log("Session ID:", sessionId);
        console.log("Initiator DID:", initiatorDid);
        console.log("Initiator Chain ID:", initiatorChainId);

        if (!sessionId || !initiatorDid || !initiatorChainId) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        // Generate a new challenge for the initiator
        const responderChallenge = this.generateChallenge();

        // Get the plugin tools
        const tools = zkredAgentIdPlugin.tools({});
        const validateAgentTool = tools.find(
          (tool: any) => tool.method === "validate_agent"
        );

        if (!validateAgentTool) {
          throw new Error("Validate agent tool not found");
        }

        // Validate the initiator agent
        const didInformation = await validateAgentTool.execute(
          null, // client
          {}, // context
          { did: initiatorDid, chainId: initiatorChainId }
        );

        if (!didInformation.success) {
          return res.status(400).json({ error: "Invalid initiator agent" });
        }

        // Store the session
        this.sessions.set(sessionId.toString(), {
          initiatorDid,
          challenge: responderChallenge,
          timestamp: Date.now(),
          did: didInformation.data.did,
        });

        res.json({
          data: {
            challenge: responderChallenge,
            sessionId,
          },
        });
      } catch (error) {
        console.error("Error in /initiate:", error);
        res.status(500).json({ error: "Failed to initiate handshake" });
      }
    });

    this.app.post("/completeHandshake", async (req: any, res: any) => {
      try {
        console.log("Received complete handshake request:", req.body);
        const { sessionId, signature } = req.body;
        console.log("Printing session id Session ID:", sessionId);
        console.log("Signature:", signature);
        if (!sessionId || !signature) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const session = this.sessions.get(sessionId);
        console.log("Session:", session);
        if (!session) {
          return res.status(404).json({ error: "Session not found" });
        }

        // Get the plugin tools
        const tools = zkredAgentIdPlugin.tools({});
        const verifySignatureTool = tools.find(
          (tool: any) => tool.method === "verify_signature"
        );

        if (!verifySignatureTool) {
          throw new Error("Verify signature tool not found");
        }

        // Verify the signature
        const isValid = await verifySignatureTool.execute(
          null, // client
          {}, // context
          {
            sessionId: sessionId.toString(),
            challenge: session.challenge,
            signature,
            did: session.did,
          }
        );
        console.log("Complete handshake validation result:", isValid.success);
        console.log("Complete handshake validation data:", isValid);

        if (!isValid.success || !isValid.isValid) {
          return res.status(401).json({ error: "Invalid signature" });
        }

        // Mark session as verified
        session.verified = true;
        session.initiatorPublicKey = session.did;

        console.log("Complete handshake successful");
        res.json({
          data: {
            sessionId,
            status: "handshake_completed",
            timestamp: Date.now(),
          },
        });
      } catch (error) {
        console.error("Error in /completeHandshake:", error);
        res.status(500).json({ error: "Failed to complete handshake" });
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

        console.log("Processing McDonald's message:", message);
        const result = await this.agentService.processMessage(message);
        console.log("McDonald's response generated successfully");

        const response = {
          response: result.content,
          success: true,
        };
        res.json(response);
      } catch (error) {
        console.error("Error processing McDonald's message:", error);
        const errorResponse = {
          error: "Error processing message",
          details: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(errorResponse);
      }
    });
  }

  start(port: number = 3002) {
    this.app.listen(port, () => {
      console.log(`🍟 McDonald's Agent API server running on port ${port}`);
      console.log(`📡 Health check: http://localhost:${port}/health`);
      console.log(`💬 Message endpoint: http://localhost:${port}/message`);
      console.log(
        `🤖 A2A Agent Card: http://localhost:${port}/.well-known/agent-card.json`
      );
      console.log(`🔗 A2A Protocol endpoints:`);
      console.log(`   - POST http://localhost:${port}/a2a/sendMessage`);
      console.log(`   - POST http://localhost:${port}/a2a/sendMessageStream`);
      console.log(`🍟 McDonald's Capabilities:`);
      console.log(`   - Combo meal creation and management`);
      console.log(`   - Drive-thru slot reservations`);
      console.log(`   - Nutritional information lookup`);
      console.log(`   - McDelivery rewards and points`);
      console.log(`   - Secure payments via Hedera blockchain`);
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

  private generateChallenge(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
