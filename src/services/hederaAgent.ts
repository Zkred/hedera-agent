const { Client, PrivateKey } = require("@hashgraph/sdk");
const {
  HederaLangchainToolkit,
  coreQueriesPlugin,
} = require("hedera-agent-kit");
const { ChatOpenAI } = require("@langchain/openai");
const { zkredAgentIdPlugin } = require("@zkred/hedera-agentid-plugin");
const { createAgent } = require("langchain");
const { SystemMessage, HumanMessage } = require("@langchain/core/messages");
import { AgentResponse } from "../types";

export class HederaAgentService {
  private agent: any;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent(): Promise<void> {
    try {
      // Initialize AI model
      const llm = this.createLLM();

      // Hedera client setup (Testnet by default)
      const client = Client.forTestnet().setOperator(
        process.env.HEDERA_ACCOUNT_ID!,
        PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!)
      );

      const hederaAgentToolkit = new HederaLangchainToolkit({
        client,
        configuration: {
          plugins: [coreQueriesPlugin, zkredAgentIdPlugin],
        },
      });

      // Fetch tools from toolkit
      const tools = hederaAgentToolkit.getTools();

      // Create the agent using the new LangChain v1.0.1 API
      this.agent = createAgent({
        model: llm,
        tools,
        systemPrompt:
          "You are a helpful assistant that can interact with the Hedera network.",
      });

      this.isInitialized = true;
      console.log("Hedera Agent initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Hedera Agent:", error);
      throw error;
    }
  }

  private createLLM(): any {
    return new ChatOpenAI({ model: "gpt-4o-mini" });
  }

  async processMessage(message: string): Promise<AgentResponse> {
    if (!this.isInitialized) {
      await this.initializeAgent();
    }

    const response = await this.agent.invoke({
      messages: [
        new SystemMessage(
          "You are a helpful assistant that can interact with the Hedera network."
        ),
        new HumanMessage(message),
      ],
    });

    return {
      content: response.messages[response.messages.length - 1].content,
      messages: response.messages,
    };
  }
}
