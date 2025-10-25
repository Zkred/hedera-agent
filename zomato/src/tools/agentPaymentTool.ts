import { tool } from "langchain";
import { z } from "zod";
import { SimpleA2AClient } from "../simpleA2AClient";

/**
 * Agent-to-Agent Payment Tool
 * This tool handles payments between agents using the Zomato agent's private key
 * and the partner restaurant agent's public key from their agent card
 */

export const processAgentPaymentTool = tool(
  async (args: {
    orderId: string;
    amount: number;
    partnerAgentUrl: string;
    memo?: string;
  }): Promise<string> => {
    try {
      console.log(
        `💳 Processing agent-to-agent payment for order ${args.orderId}`
      );
      console.log(`💰 Amount: ${args.amount} HBAR`);
      console.log(`🤝 Partner Agent: ${args.partnerAgentUrl}`);

      // Validate payment parameters
      if (args.amount <= 0) {
        return JSON.stringify({
          success: false,
          error: "Invalid payment amount",
          orderId: args.orderId,
        });
      }

      if (!args.partnerAgentUrl) {
        return JSON.stringify({
          success: false,
          error: "Missing partner agent URL",
          orderId: args.orderId,
        });
      }

      // Get partner agent's public key from their agent card
      let partnerPublicKey = null;
      let partnerAccountId = null;

      try {
        console.log("🔍 Fetching partner agent card...");
        const partnerClient = new SimpleA2AClient(args.partnerAgentUrl);
        const agentCard = await partnerClient.getAgentCard();

        console.log(
          "📋 Partner agent card:",
          JSON.stringify(agentCard, null, 2)
        );

        // Extract public key and account ID from agent card
        if (agentCard.publicKey) {
          partnerPublicKey = agentCard.publicKey;
        }
        if (agentCard.accountId) {
          partnerAccountId = agentCard.accountId;
        }

        console.log(`🔑 Partner public key: ${partnerPublicKey}`);
        console.log(`🏦 Partner account ID: ${partnerAccountId}`);
      } catch (cardError) {
        console.error("Failed to get partner agent card:", cardError);
        return JSON.stringify({
          success: false,
          error: "Failed to get partner agent information",
          details:
            cardError instanceof Error ? cardError.message : "Unknown error",
          orderId: args.orderId,
        });
      }

      if (!partnerPublicKey && !partnerAccountId) {
        return JSON.stringify({
          success: false,
          error: "Partner agent card missing required payment information",
          orderId: args.orderId,
        });
      }

      // In a real implementation, this would use the Hedera agent kit tools
      // to transfer HBAR from the Zomato agent to the partner agent
      const paymentId = `agent_payment_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate payment success
      const paymentResult = {
        success: true,
        paymentId: paymentId,
        orderId: args.orderId,
        amount: args.amount,
        fromAgent: "Zomato Agent",
        toAgent: args.partnerAgentUrl,
        partnerPublicKey: partnerPublicKey,
        partnerAccountId: partnerAccountId,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toISOString(),
        status: "completed",
        memo: args.memo || `Agent-to-agent payment for order ${args.orderId}`,
        paymentType: "agent_to_agent",
      };

      console.log(
        `✅ Agent-to-agent payment processed successfully: ${paymentId}`
      );

      return JSON.stringify(paymentResult);
    } catch (error) {
      console.error("Agent payment processing error:", error);
      return JSON.stringify({
        success: false,
        error: "Agent payment processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
        orderId: args.orderId,
      });
    }
  },
  {
    name: "process_agent_payment",
    description:
      "Process HBAR payment from Zomato agent to partner restaurant agent using agent's private key and partner's public key from agent card. This enables secure agent-to-agent transactions.",
    schema: z.object({
      orderId: z
        .string()
        .describe("The unique identifier of the order to pay for"),
      amount: z.number().describe("The amount to pay in HBAR"),
      partnerAgentUrl: z
        .string()
        .describe(
          "The URL of the partner restaurant agent (e.g., http://localhost:3001)"
        ),
      memo: z
        .string()
        .optional()
        .describe("Optional memo for the payment transaction"),
    }),
  }
);

export const getAgentPaymentStatusTool = tool(
  async (args: { paymentId: string }): Promise<string> => {
    try {
      console.log(`🔍 Checking agent payment status for: ${args.paymentId}`);

      // In a real implementation, this would query the Hedera network
      const paymentStatus = {
        paymentId: args.paymentId,
        status: "completed",
        timestamp: new Date().toISOString(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        confirmations: 3,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
        paymentType: "agent_to_agent",
      };

      return JSON.stringify({
        success: true,
        payment: paymentStatus,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: "Failed to get agent payment status",
        details: error instanceof Error ? error.message : "Unknown error",
        paymentId: args.paymentId,
      });
    }
  },
  {
    name: "get_agent_payment_status",
    description:
      "Get the status of an agent-to-agent payment transaction on the Hedera network",
    schema: z.object({
      paymentId: z
        .string()
        .describe("The unique identifier of the agent payment"),
    }),
  }
);

export const refundAgentPaymentTool = tool(
  async (args: {
    paymentId: string;
    amount: number;
    partnerAgentUrl: string;
    reason?: string;
  }): Promise<string> => {
    try {
      console.log(
        `🔄 Processing agent-to-agent refund for payment: ${args.paymentId}`
      );

      // Validate refund parameters
      if (args.amount <= 0) {
        return JSON.stringify({
          success: false,
          error: "Invalid refund amount",
          paymentId: args.paymentId,
        });
      }

      // Get partner agent's public key for refund
      let partnerPublicKey = null;
      try {
        const partnerClient = new SimpleA2AClient(args.partnerAgentUrl);
        const agentCard = await partnerClient.getAgentCard();
        partnerPublicKey = agentCard.publicKey;
      } catch (cardError) {
        console.error(
          "Failed to get partner agent card for refund:",
          cardError
        );
      }

      // Simulate refund processing
      const refundId = `agent_refund_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Simulate refund processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const refundResult = {
        success: true,
        refundId: refundId,
        originalPaymentId: args.paymentId,
        amount: args.amount,
        fromAgent: args.partnerAgentUrl,
        toAgent: "Zomato Agent",
        partnerPublicKey: partnerPublicKey,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toISOString(),
        status: "completed",
        reason: args.reason || "Order cancellation",
        paymentType: "agent_to_agent_refund",
      };

      console.log(
        `✅ Agent-to-agent refund processed successfully: ${refundId}`
      );

      return JSON.stringify(refundResult);
    } catch (error) {
      console.error("Agent refund processing error:", error);
      return JSON.stringify({
        success: false,
        error: "Agent refund processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
        paymentId: args.paymentId,
      });
    }
  },
  {
    name: "refund_agent_payment",
    description:
      "Process a refund from partner restaurant agent back to Zomato agent using agent-to-agent payment system",
    schema: z.object({
      paymentId: z
        .string()
        .describe("The unique identifier of the original agent payment"),
      amount: z.number().describe("The amount to refund in HBAR"),
      partnerAgentUrl: z
        .string()
        .describe("The URL of the partner restaurant agent"),
      reason: z.string().optional().describe("Reason for the refund"),
    }),
  }
);
