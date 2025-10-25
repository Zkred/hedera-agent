import { tool } from "langchain";
import { z } from "zod";

/**
 * Balance Manager Tool
 * This tool manages the agent's HBAR balance and tracks transactions
 */

// Mock balance storage (in a real implementation, this would be persistent)
let agentBalance = 100.0; // Starting balance of 100 HBAR
const transactionHistory: any[] = [];

export const getBalanceTool = tool(
  async (): Promise<string> => {
    try {
      console.log(`💰 Current agent balance: ${agentBalance} HBAR`);

      return JSON.stringify({
        success: true,
        balance: agentBalance,
        currency: "HBAR",
        timestamp: new Date().toISOString(),
        transactionHistory: transactionHistory.slice(-10), // Last 10 transactions
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: "Failed to get balance",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_balance",
    description: "Get the current HBAR balance of the agent",
    schema: z.object({}),
  }
);

export const processPaymentTool = tool(
  async (args: {
    orderId: string;
    amount: number;
    recipientAccountId: string;
    memo?: string;
  }): Promise<string> => {
    try {
      console.log(
        `💳 Processing payment: ${args.amount} HBAR for order ${args.orderId}`
      );

      // Check if agent has sufficient balance
      if (agentBalance < args.amount) {
        return JSON.stringify({
          success: false,
          error: "Insufficient balance",
          currentBalance: agentBalance,
          requiredAmount: args.amount,
          shortfall: args.amount - agentBalance,
        });
      }

      // Deduct amount from balance
      const previousBalance = agentBalance;
      agentBalance -= args.amount;

      // Record transaction
      const transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: args.orderId,
        amount: args.amount,
        recipientAccountId: args.recipientAccountId,
        memo: args.memo || `Payment for order ${args.orderId}`,
        previousBalance: previousBalance,
        newBalance: agentBalance,
        timestamp: new Date().toISOString(),
        status: "completed",
      };

      transactionHistory.push(transaction);

      console.log(`✅ Payment processed successfully`);
      console.log(`💰 Balance: ${previousBalance} HBAR → ${agentBalance} HBAR`);

      return JSON.stringify({
        success: true,
        transaction: transaction,
        message: "Payment processed successfully",
        balance: agentBalance,
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      return JSON.stringify({
        success: false,
        error: "Payment processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
        orderId: args.orderId,
      });
    }
  },
  {
    name: "process_payment",
    description: "Process a payment and deduct amount from agent's balance",
    schema: z.object({
      orderId: z.string().describe("The unique identifier of the order"),
      amount: z.number().describe("The amount to pay in HBAR"),
      recipientAccountId: z.string().describe("The recipient's account ID"),
      memo: z.string().optional().describe("Optional memo for the transaction"),
    }),
  }
);

export const addFundsTool = tool(
  async (args: { amount: number; source: string }): Promise<string> => {
    try {
      console.log(
        `💰 Adding ${args.amount} HBAR to agent balance from ${args.source}`
      );

      const previousBalance = agentBalance;
      agentBalance += args.amount;

      // Record transaction
      const transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "deposit",
        amount: args.amount,
        source: args.source,
        previousBalance: previousBalance,
        newBalance: agentBalance,
        timestamp: new Date().toISOString(),
        status: "completed",
      };

      transactionHistory.push(transaction);

      console.log(`✅ Funds added successfully`);
      console.log(`💰 Balance: ${previousBalance} HBAR → ${agentBalance} HBAR`);

      return JSON.stringify({
        success: true,
        transaction: transaction,
        message: "Funds added successfully",
        balance: agentBalance,
      });
    } catch (error) {
      console.error("Add funds error:", error);
      return JSON.stringify({
        success: false,
        error: "Failed to add funds",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "add_funds",
    description: "Add funds to the agent's balance",
    schema: z.object({
      amount: z.number().describe("The amount to add in HBAR"),
      source: z.string().describe("The source of the funds"),
    }),
  }
);

export const getTransactionHistoryTool = tool(
  async (args: { limit?: number }): Promise<string> => {
    try {
      const limit = args.limit || 20;
      const recentTransactions = transactionHistory.slice(-limit);

      console.log(
        `📋 Retrieved ${recentTransactions.length} recent transactions`
      );

      return JSON.stringify({
        success: true,
        transactions: recentTransactions,
        totalTransactions: transactionHistory.length,
        currentBalance: agentBalance,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: "Failed to get transaction history",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_transaction_history",
    description: "Get the transaction history of the agent",
    schema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of transactions to return"),
    }),
  }
);

export const refundPaymentTool = tool(
  async (args: {
    originalTransactionId: string;
    amount: number;
    reason: string;
  }): Promise<string> => {
    try {
      console.log(
        `🔄 Processing refund: ${args.amount} HBAR for transaction ${args.originalTransactionId}`
      );

      // Add amount back to balance
      const previousBalance = agentBalance;
      agentBalance += args.amount;

      // Record refund transaction
      const refundTransaction = {
        id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalTransactionId: args.originalTransactionId,
        amount: args.amount,
        reason: args.reason,
        previousBalance: previousBalance,
        newBalance: agentBalance,
        timestamp: new Date().toISOString(),
        status: "completed",
        type: "refund",
      };

      transactionHistory.push(refundTransaction);

      console.log(`✅ Refund processed successfully`);
      console.log(`💰 Balance: ${previousBalance} HBAR → ${agentBalance} HBAR`);

      return JSON.stringify({
        success: true,
        refundTransaction: refundTransaction,
        message: "Refund processed successfully",
        balance: agentBalance,
      });
    } catch (error) {
      console.error("Refund processing error:", error);
      return JSON.stringify({
        success: false,
        error: "Refund processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
        originalTransactionId: args.originalTransactionId,
      });
    }
  },
  {
    name: "refund_payment",
    description: "Process a refund and add amount back to agent's balance",
    schema: z.object({
      originalTransactionId: z.string().describe("The original transaction ID"),
      amount: z.number().describe("The amount to refund in HBAR"),
      reason: z.string().describe("Reason for the refund"),
    }),
  }
);
