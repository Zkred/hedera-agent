// import { Message } from "../types/chat";

const AGENT_URL = process.env.REACT_APP_AGENT_URL || "http://localhost:3000";

export class AgentService {
  private sessionId: string;
  private contextId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.contextId = this.generateContextId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateContextId(): string {
    return `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch(`${AGENT_URL}/a2a/sendMessage`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Agent-DID":
            process.env.REACT_APP_AGENT_DID || "did:iden3:polygon:amoy:test",
          "X-Session-ID": this.sessionId,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now().toString(),
          message: {
            messageId: `msg_${Date.now()}`,
            role: "user",
            parts: [
              {
                kind: "text",
                text: message,
              },
            ],
            contextId: this.contextId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Agent error");
      }

      return data.result.parts[0].text;
    } catch (error) {
      console.error("Error sending message to agent:", error);
      throw error;
    }
  }

  async sendStreamMessage(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${AGENT_URL}/a2a/sendMessageStream`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "X-Agent-DID":
            process.env.REACT_APP_AGENT_DID || "did:iden3:polygon:amoy:test",
          "X-Session-ID": this.sessionId,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now().toString(),
          message: {
            messageId: `msg_${Date.now()}`,
            role: "user",
            parts: [
              {
                kind: "text",
                text: message,
              },
            ],
            contextId: this.contextId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

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
              if (data.kind === "message" && data.parts) {
                for (const part of data.parts) {
                  if (part.kind === "text") {
                    onChunk(part.text);
                  }
                }
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in stream message:", error);
      throw error;
    }
  }

  async getAgentCard() {
    try {
      const response = await fetch(`${AGENT_URL}/.well-known/agent-card.json`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching agent card:", error);
      throw error;
    }
  }
}
