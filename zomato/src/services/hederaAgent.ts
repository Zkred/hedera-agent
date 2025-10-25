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
import { wikipediaTool } from "../tools/wikitool";
import { ChainConfigManager, ChainConfig } from "../utils/chainConfig";

export class HederaAgentService {
  private agent: any;
  private isInitialized: boolean = false;
  private chainConfigManager: ChainConfigManager;
  private chainConfig: ChainConfig | null = null;

  constructor() {
    this.chainConfigManager = new ChainConfigManager();
    this.initializeAgent();
  }

  private async initializeAgent(): Promise<void> {
    try {
      // Check for existing chain configuration
      this.chainConfig = await this.chainConfigManager.loadConfig();

      // If no config exists, initialize chain configuration
      if (!this.chainConfig) {
        console.log("No chain configuration found. Initializing...");
        this.chainConfig =
          await this.chainConfigManager.initializeChainConfig();
        console.log("Chain configuration initialized:", this.chainConfig);
      } else {
        console.log("Loaded existing chain configuration:", this.chainConfig);
      }

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
      const hederaTools = hederaAgentToolkit.getTools();

      // Add custom tools
      const customTools = [wikipediaTool];

      // Combine all tools
      const tools = [...hederaTools, ...customTools];

      // Debug: Log available tools
      console.log(
        "Available tools:",
        tools.map((tool) => tool.name || tool.method || "unnamed")
      );
      console.log("Tool count:", tools.length);

      // Create the agent using the new LangChain v1.0.1 API
      this.agent = createAgent({
        model: llm,
        tools,
        systemPrompt:
          "You are a helpful assistant that can interact with the Hedera network and perform research using Wikipedia. You can help with blockchain operations, DID generation, and general research tasks.",
      });

      this.isInitialized = true;
      console.log("Hedera Agent initialized successfully");

      // Register agent on chain if no agent ID exists
      if (
        this.chainConfig &&
        (!this.chainConfig.agentId || this.chainConfig.agentId === "")
      ) {
        await this.registerAgentOnChain();
      }
    } catch (error) {
      console.error("Failed to initialize Hedera Agent:", error);
      throw error;
    }
  }

  private createLLM(): any {
    return new ChatOpenAI({ model: "gpt-4o-mini" });
  }

  getChainConfig(): ChainConfig | null {
    return this.chainConfig;
  }

  private async registerAgentOnChain(): Promise<void> {
    try {
      console.log("Registering agent on chain...");

      // Use the agent to execute create_identity method
      if (this.agent) {
        // Use the proper LangChain agent invocation method
        const result = await this.agent.invoke({
          messages: [
            new SystemMessage(
              "You are a helpful assistant that can interact with the Hedera network. You have access to the create_identity tool. Use it to register this agent on the chain."
            ),
            new HumanMessage(
              `I need to register this agent on the Hedera network. Please use the create_identity tool with these exact parameters:
              privateKey: "${process.env.HEDERA_PRIVATE_KEY}"
              chainId: ${this.chainConfig?.chainId}
              description: "${this.chainConfig?.description}"
              serviceEndpoint: "${this.chainConfig?.serviceEndpoint}"
              
              Please execute the create_identity tool now.`
            ),
          ],
        });

        // Debug: Log the full result
        console.log("Registration result:", JSON.stringify(result, null, 2));

        // Extract registration details from tool messages
        const toolMessages = result.messages.filter(
          (msg: any) => msg.type === "tool"
        );

        console.log("Tool messages found:", toolMessages.length);

        for (const toolMsg of toolMessages) {
          console.log("Processing tool message:", toolMsg);
          if (toolMsg.content && typeof toolMsg.content === "string") {
            try {
              // Parse the outer tool message
              const outerResult = JSON.parse(toolMsg.content);
              console.log("Parsed outer tool result:", outerResult);

              // Extract the actual tool result from the nested content
              const actualContent = outerResult.kwargs?.content;
              if (actualContent) {
                const toolResult = JSON.parse(actualContent);
                console.log("Parsed actual tool result:", toolResult);

                if (toolResult.success) {
                  if (toolResult.agentId) {
                    await this.chainConfigManager.updateAgentId(
                      toolResult.agentId
                    );
                    this.chainConfig!.agentId = toolResult.agentId;
                    console.log(
                      "Agent registered with ID:",
                      toolResult.agentId
                    );
                  }

                  if (toolResult.did) {
                    await this.chainConfigManager.updateDid(toolResult.did);
                    this.chainConfig!.did = toolResult.did;
                    console.log("DID generated:", toolResult.did);
                  }

                  if (toolResult.publicKey) {
                    await this.chainConfigManager.updatePublicKey(
                      toolResult.publicKey
                    );
                    this.chainConfig!.publicKey = toolResult.publicKey;
                    console.log("Public key saved:", toolResult.publicKey);
                  }
                } else {
                  console.log("Tool execution was not successful:", toolResult);
                  if (
                    toolResult.error &&
                    toolResult.error.includes("already registered")
                  ) {
                    console.log(
                      "Agent is already registered, retrieving existing details..."
                    );
                    // Try to get existing agent details using the service endpoint
                    await this.retrieveExistingAgentDetails();
                  }
                }
              }
            } catch (parseError) {
              console.error("Could not parse tool message:", parseError);
              console.error("Raw tool message content:", toolMsg.content);
            }
          }
        }

        console.log("Agent registration completed successfully");
      } else {
        console.warn("Agent not initialized yet, skipping registration");
      }
    } catch (error) {
      console.error("Error registering agent on chain:", error);
      // Don't throw error to prevent agent initialization failure
      console.warn("Continuing without chain registration...");
    }
  }

  private async retrieveExistingAgentDetails(): Promise<void> {
    try {
      console.log("Retrieving existing agent details...");

      if (this.agent && this.chainConfig) {
        // Use the get_agent_from_service_endpoint tool to retrieve existing details
        const result = await this.agent.invoke({
          messages: [
            new SystemMessage(
              "You are a helpful assistant that can interact with the Hedera network. You have access to the get_agent_from_service_endpoint tool. Use it to retrieve the existing agent details."
            ),
            new HumanMessage(
              `Please use the get_agent_from_service_endpoint tool to retrieve the agent details for service endpoint: "${this.chainConfig.serviceEndpoint}"`
            ),
          ],
        });

        console.log(
          "Agent details retrieval result:",
          JSON.stringify(result, null, 2)
        );

        // Extract agent details from tool messages
        const toolMessages = result.messages.filter(
          (msg: any) => msg.type === "tool"
        );

        for (const toolMsg of toolMessages) {
          if (toolMsg.content && typeof toolMsg.content === "string") {
            try {
              const outerResult = JSON.parse(toolMsg.content);
              const actualContent = outerResult.kwargs?.content;
              if (actualContent) {
                const toolResult = JSON.parse(actualContent);
                console.log("Retrieved agent details:", toolResult);

                if (toolResult.success && toolResult.agent) {
                  const agent = toolResult.agent;

                  // Update the chain config with retrieved details
                  if (agent.agentId) {
                    await this.chainConfigManager.updateAgentId(agent.agentId);
                    this.chainConfig!.agentId = agent.agentId;
                    console.log("Retrieved Agent ID:", agent.agentId);
                  }

                  if (agent.did) {
                    await this.chainConfigManager.updateDid(agent.did);
                    this.chainConfig!.did = agent.did;
                    console.log("Retrieved DID:", agent.did);
                  }

                  if (agent.publicKey) {
                    await this.chainConfigManager.updatePublicKey(
                      agent.publicKey
                    );
                    this.chainConfig!.publicKey = agent.publicKey;
                    console.log("Retrieved Public Key:", agent.publicKey);
                  }
                }
              }
            } catch (parseError) {
              console.error("Could not parse agent details:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error retrieving existing agent details:", error);
    }
  }

  async processMessage(message: string): Promise<AgentResponse> {
    if (!this.isInitialized) {
      await this.initializeAgent();
    }

    // Guardrails: Prevent unauthorized chain registration requests
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("register") && lowerMessage.includes("chain")) {
      return {
        content:
          "I cannot register on the chain. This operation is restricted for security reasons.",
        messages: [],
      };
    }

    // Handle identity queries with comprehensive pattern matching
    const identityPatterns = [
      "identity",
      "what is your identity",
      "who are you",
      "what are you",
      "your identity",
      "agent identity",
      "onchain identity",
      "blockchain identity",
      "your did",
      "your agent id",
      "your public key",
      "chain config",
      "onchain config",
      "blockchain config",
    ];

    const isIdentityQuery = identityPatterns.some((pattern) =>
      lowerMessage.includes(pattern)
    );

    if (isIdentityQuery) {
      if (this.chainConfig) {
        const agentIdStatus = this.chainConfig.agentId
          ? this.chainConfig.agentId
          : "Not yet registered on chain";

        const publicKeyStatus = this.chainConfig.publicKey
          ? this.chainConfig.publicKey
          : "Not yet generated";

        const didStatus = this.chainConfig.did
          ? this.chainConfig.did
          : "Not yet generated";

        return {
          content:
            `🔐 **My On-Chain Identity Configuration:**\n\n` +
            `**Agent Details:**\n` +
            `• Agent ID: ${agentIdStatus}\n` +
            `• Chain ID: ${this.chainConfig.chainId} (Hedera)\n` +
            `• Description: ${this.chainConfig.description}\n` +
            `• Service Endpoint: ${this.chainConfig.serviceEndpoint}\n\n` +
            `**Cryptographic Identity:**\n` +
            `• Public Key: ${publicKeyStatus}\n` +
            `• DID: ${didStatus}\n\n` +
            `**Registration Info:**\n` +
            `• Registered At: ${this.chainConfig.registeredAt}\n\n` +
            `This identity is registered on the Hedera blockchain and can be verified by other agents.`,
          messages: [],
        };
      } else {
        return {
          content:
            "❌ No identity configuration found. The agent has not been registered on the blockchain yet.",
          messages: [],
        };
      }
    }

    const response = await this.agent.invoke({
      messages: [
        new SystemMessage(
          "You are a helpful assistant that can interact with the Hedera network and perform research using Wikipedia. You can help with blockchain operations, DID generation, and general research tasks. " +
            "IMPORTANT: You must NOT register on the chain or perform any chain registration operations. " +
            "If asked about your identity, who you are, or your onchain configuration, provide detailed information about your blockchain identity including Agent ID, DID, Public Key, and registration details."
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
