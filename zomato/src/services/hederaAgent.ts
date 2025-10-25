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

import {
  restaurantSearchTool,
  getRestaurantDetailsTool,
} from "../tools/restaurantTool";
import { getMenuTool, getMenuItemDetailsTool } from "../tools/menuTool";
import {
  placeOrderTool,
  getOrderStatusTool,
  updateOrderStatusTool,
} from "../tools/orderTool";
import {
  mcdonaldsIntegrationTool,
  getMcdonaldsCapabilitiesTool,
} from "../tools/mcdonaldsIntegrationTool";
import {
  pizzaHutIntegrationTool,
  getPizzaHutCapabilitiesTool,
} from "../tools/pizzaHutIntegrationTool";
import {
  processPaymentTool,
  getPaymentStatusTool,
  refundPaymentTool,
} from "../tools/paymentTool";
import {
  processAgentPaymentTool,
  getAgentPaymentStatusTool,
  refundAgentPaymentTool,
} from "../tools/agentPaymentTool";
import {
  acceptOrderTool,
  validatePaymentTool,
  getAcceptedOrderStatusTool,
  cancelOrderTool,
} from "../tools/orderAcceptanceTool";
import {
  getBalanceTool,
  processPaymentTool as balanceProcessPaymentTool,
  addFundsTool,
  getTransactionHistoryTool,
  refundPaymentTool as balanceRefundPaymentTool,
} from "../tools/balanceManager";
import { ChainConfigManager, ChainConfig } from "../utils/chainConfig";

export class HederaAgentService {
  private agent: any;
  private isInitialized: boolean = false;
  private chainConfigManager: ChainConfigManager;
  private chainConfig: ChainConfig | null = null;
  private conversationHistory: any[] = [];

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
      const customTools = [
        // wikipediaTool,
        // restaurantSearchTool,
        // getRestaurantDetailsTool,
        // getMenuTool,
        // getMenuItemDetailsTool,
        // placeOrderTool,
        // getOrderStatusTool,
        // updateOrderStatusTool,
        mcdonaldsIntegrationTool,
        getMcdonaldsCapabilitiesTool,
        pizzaHutIntegrationTool,
        getPizzaHutCapabilitiesTool,
        processPaymentTool,
        getPaymentStatusTool,
        refundPaymentTool,
        processAgentPaymentTool,
        getAgentPaymentStatusTool,
        refundAgentPaymentTool,
        acceptOrderTool,
        validatePaymentTool,
        getAcceptedOrderStatusTool,
        cancelOrderTool,
        getBalanceTool,
        balanceProcessPaymentTool,
        addFundsTool,
        getTransactionHistoryTool,
        balanceRefundPaymentTool,
      ];

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
          "You are Zomato Food Delivery Agent, a specialized assistant for food delivery services. You can help users discover restaurants, browse menus, place orders, and track deliveries. You also have access to Hedera blockchain operations for secure payments and identity verification, and can perform research using Wikipedia. " +
          "Key capabilities: " +
          "- Search for restaurants by location, cuisine, rating, and delivery preferences (always find available restaurants) " +
          "- Browse restaurant menus and get detailed item information " +
          "- Place food orders with automatic price calculation and validation " +
          "- Track order status and delivery progress " +
          "- Handle secure payments through Hedera blockchain using HBAR " +
          "- Process crypto payments with user's private key " +
          "- Get payment status and process refunds " +
          "- Provide customer support for food delivery queries " +
          "- INTEGRATION WITH PARTNER RESTAURANTS: " +
          "  * McDonald's Integration: Use mcdonalds_integration tool to get menu info, combo options, drive-thru availability " +
          "  * Pizza Hut Integration: Use pizza_hut_integration tool to get pizza customization options, loyalty info, promotions " +
          "  * IMPORTANT: Partner agents provide INFORMATION only - they cannot accept orders " +
          "  * After getting partner info, use Zomato's place_order tool to actually place the order " +
          "  * Partner restaurants provide menu/customization data, not order processing " +
          "- ORDER ACCEPTANCE & PAYMENT VALIDATION: " +
          "  * Use accept_order tool to accept orders with payment validation " +
          "  * Users provide order ID and transaction ID for payment verification " +
          "  * Use validate_payment tool to verify blockchain transactions " +
          "  * Use get_accepted_order_status tool to track order progress " +
          "  * Use cancel_order tool for order cancellations and refunds " +
          "- BALANCE MANAGEMENT: " +
          "  * Use get_balance tool to check agent's current HBAR balance " +
          "  * Use process_payment tool to deduct payments from agent's balance " +
          "  * Use add_funds tool to add funds to agent's balance " +
          "  * Use get_transaction_history tool to view payment history " +
          "  * Use refund_payment tool to process refunds and restore balance " +
          "- PAYMENT PROCESSING: " +
          "  * Use agent-to-agent payment system with process_agent_payment tool " +
          "  * Agent uses its own private key from environment variables " +
          "  * Get partner agent's public key from their agent card " +
          "  * Convert USD amounts to HBAR for payment processing " +
          "  * Always confirm payment success before marking orders as confirmed " +
          "  * Use get_agent_payment_status to check payment status " +
          "  * Use refund_agent_payment for order cancellations or refunds " +
          "IMPORTANT: Carefully analyze the user's request to determine which restaurant they want. If they mention Pizza Hut or pizza offers, use pizza_hut_integration. If they mention McDonald's or Big Mac, use mcdonalds_integration. " +
          "For crypto payments, use agent-to-agent payment system - no user private key required. " +
          "Always be helpful, friendly, and provide accurate information about restaurants, menus, and orders.",
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

  clearConversationHistory(): void {
    this.conversationHistory = [];
    console.log("Conversation history cleared");
  }

  getConversationHistory(): any[] {
    return this.conversationHistory;
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

    // Build conversation context
    const messages = [
      new SystemMessage(
        "You are Zomato Food Delivery Agent, a specialized assistant for food delivery services. You can help users discover restaurants, browse menus, place orders, and track deliveries. You also have access to Hedera blockchain operations for secure payments and identity verification, and can perform research using Wikipedia. " +
          "Key capabilities: " +
          "- Search for restaurants by location, cuisine, rating, and delivery preferences (always find available restaurants) " +
          "- Browse restaurant menus and get detailed item information " +
          "- Place food orders with automatic price calculation and validation " +
          "- Track order status and delivery progress " +
          "- Handle secure payments through Hedera blockchain using HBAR " +
          "- Process crypto payments with user's private key " +
          "- Get payment status and process refunds " +
          "- Provide customer support for food delivery queries " +
          "- INTEGRATION WITH PARTNER RESTAURANTS: " +
          "  * McDonald's Integration: Use mcdonalds_integration tool to get menu info, combo options, drive-thru availability " +
          "  * Pizza Hut Integration: Use pizza_hut_integration tool to get pizza customization options, loyalty info, promotions " +
          "  * IMPORTANT: Partner agents provide INFORMATION only - they cannot accept orders " +
          "  * After getting partner info, use Zomato's place_order tool to actually place the order " +
          "  * Partner restaurants provide menu/customization data, not order processing " +
          "- ORDER ACCEPTANCE & PAYMENT VALIDATION: " +
          "  * Use accept_order tool to accept orders with payment validation " +
          "  * Users provide order ID and transaction ID for payment verification " +
          "  * Use validate_payment tool to verify blockchain transactions " +
          "  * Use get_accepted_order_status tool to track order progress " +
          "  * Use cancel_order tool for order cancellations and refunds " +
          "- BALANCE MANAGEMENT: " +
          "  * Use get_balance tool to check agent's current HBAR balance " +
          "  * Use process_payment tool to deduct payments from agent's balance " +
          "  * Use add_funds tool to add funds to agent's balance " +
          "  * Use get_transaction_history tool to view payment history " +
          "  * Use refund_payment tool to process refunds and restore balance " +
          "- PAYMENT PROCESSING: " +
          "  * Use agent-to-agent payment system with process_agent_payment tool " +
          "  * Agent uses its own private key from environment variables " +
          "  * Get partner agent's public key from their agent card " +
          "  * Convert USD amounts to HBAR for payment processing " +
          "  * Always confirm payment success before marking orders as confirmed " +
          "  * Use get_agent_payment_status to check payment status " +
          "  * Use refund_agent_payment for order cancellations or refunds " +
          "- CONVERSATION CONTEXT: " +
          "  * Always maintain context of the current conversation " +
          "  * If user confirms an order, continue with the order process " +
          "  * If user is in the middle of placing an order, help them complete it " +
          "  * Remember previous messages in the conversation to provide coherent responses " +
          "IMPORTANT: Carefully analyze the user's request to determine which restaurant they want. If they mention Pizza Hut or pizza offers, use pizza_hut_integration. If they mention McDonald's or Big Mac, use mcdonalds_integration. " +
          "For crypto payments, use agent-to-agent payment system - no user private key required. " +
          "You must NOT register on the chain or perform any chain registration operations. " +
          "If asked about your identity, who you are, or your onchain configuration, provide detailed information about your blockchain identity including Agent ID, DID, Public Key, and registration details. " +
          "NEVER decline orders due to location - always find available restaurants and accept orders. " +
          "Always be helpful, friendly, and provide accurate information about restaurants, menus, and orders."
      ),
    ];

    // Add conversation history to maintain context
    if (this.conversationHistory.length > 0) {
      messages.push(...this.conversationHistory.slice(-10)); // Keep last 10 messages for context
    }

    // Add current message
    messages.push(new HumanMessage(message));

    const response = await this.agent.invoke({
      messages: messages,
    });

    // Update conversation history with the new messages
    this.conversationHistory.push(new HumanMessage(message));
    if (response.messages && response.messages.length > 0) {
      this.conversationHistory.push(
        response.messages[response.messages.length - 1]
      );
    }

    // Keep conversation history manageable (max 20 messages)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    return {
      content: response.messages[response.messages.length - 1].content,
      messages: response.messages,
    };
  }
}
