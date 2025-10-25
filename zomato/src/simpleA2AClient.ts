/**
 * Simple A2A client for testing and integration
 *
 * This client provides a clean interface for communicating with A2A-compliant agents.
 * It supports both regular message sending and streaming communication.
 *
 * Features:
 * - Agent Card retrieval
 * - Message sending with proper A2A format
 * - Streaming message support with Server-Sent Events
 * - Error handling and response parsing
 * - UUID generation for message IDs
 *
 * Usage:
 * ```typescript
 * const client = new SimpleA2AClient("http://localhost:3000");
 * const response = await client.sendMessage("Hello, agent!");
 * ```
 */

export class SimpleA2AClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  async getAgentCard(): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/.well-known/agent-card.json`
      );
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch agent card: ${error}`);
    }
  }

  async sendMessage(message: string, sessionId?: string): Promise<string> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add session ID header if provided
      if (sessionId) {
        headers["x-session-id"] = sessionId;
      }

      const response = await fetch(`${this.baseUrl}/a2a/sendMessage`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          message: {
            messageId: this.generateUUID(),
            role: "user",
            parts: [{ kind: "text", text: message }],
            kind: "message",
          },
        }),
      });

      const result: unknown = await response.json();

      if (
        typeof result === "object" &&
        result !== null &&
        "error" in result &&
        typeof (result as any).error === "object" &&
        (result as any).error !== null
      ) {
        throw new Error(
          `A2A Error: ${
            (result as any).error.message ??
            JSON.stringify((result as any).error)
          }`
        );
      }

      if (
        typeof result === "object" &&
        result !== null &&
        "result" in result &&
        (result as any).result &&
        Array.isArray((result as any).result.parts) &&
        (result as any).result.parts.length > 0 &&
        typeof (result as any).result.parts[0].text === "string"
      ) {
        return (result as any).result.parts[0].text;
      }

      throw new Error("Invalid A2A response format");
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  async sendMessageStream(
    message: string
  ): Promise<AsyncGenerator<any, void, unknown>> {
    const response = await fetch(`${this.baseUrl}/a2a/sendMessageStream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          messageId: this.generateUUID(),
          role: "user",
          parts: [{ kind: "text", text: message }],
          kind: "message",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return this.parseSSEStream(response);
  }

  private async *parseSSEStream(
    response: Response
  ): AsyncGenerator<any, void, unknown> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data;
            } catch (e) {
              console.warn("Failed to parse SSE data:", line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
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

// Test functions
export async function testSimpleA2AClient() {
  console.log("🧪 Testing Simple A2A Client Integration...");

  const client = new SimpleA2AClient("http://localhost:3000");

  try {
    // Test 1: Get agent card
    console.log("\n📋 Testing Agent Card retrieval...");
    const agentCard = await client.getAgentCard();
    console.log("✅ Agent Card retrieved successfully:");
    console.log(`   Name: ${agentCard.name}`);
    console.log(`   Description: ${agentCard.description}`);
    console.log(`   Skills: ${agentCard.skills?.length || 0} available`);

    // Test 2: Send simple message
    console.log("\n💬 Testing simple message...");
    const response1 = await client.sendMessage(
      "Hello, can you help me with Hedera operations?"
    );
    console.log("✅ Simple message response:");
    console.log(`   Response: ${response1.substring(0, 100)}...`);

    // Test 3: Send DID generation request
    console.log("\n🆔 Testing DID generation...");
    const response2 = await client.sendMessage("Generate a new DID for me");
    console.log("✅ DID generation response:");
    console.log(`   Response: ${response2.substring(0, 100)}...`);

    // Test 4: Send Hedera network query
    console.log("\n🔗 Testing Hedera network query...");
    const response3 = await client.sendMessage(
      "What can you do with the Hedera network?"
    );
    console.log("✅ Hedera network query response:");
    console.log(`   Response: ${response3.substring(0, 100)}...`);

    console.log("\n🎉 All A2A client tests completed successfully!");
  } catch (error) {
    console.error("❌ A2A client test failed:", error);
    throw error;
  }
}

export async function testSimpleA2AStreaming() {
  console.log("🌊 Testing Simple A2A Streaming...");

  const client = new SimpleA2AClient("http://localhost:3000");

  try {
    const stream = await client.sendMessageStream(
      "Tell me about Hedera blockchain step by step"
    );

    console.log("📡 Streaming response:");
    for await (const event of stream) {
      if (event.kind === "task") {
        console.log(`📋 Task created: ${event.id} (${event.status.state})`);
      } else if (event.kind === "status-update") {
        console.log(`📊 Status update: ${event.status.state}`);
      } else if (event.kind === "message") {
        console.log(`💬 Message: ${event.parts[0].text.substring(0, 50)}...`);
      } else if (event.kind === "artifact-update") {
        console.log(`📎 Artifact: ${event.artifact.artifactId}`);
      }
    }
    console.log("✅ Streaming test completed!");
  } catch (error) {
    console.error("❌ Streaming test failed:", error);
    throw error;
  }
}
