import { tool } from "langchain";
import { z } from "zod";
import { processPaymentTool } from "./balanceManager";

/**
 * Order Acceptance Tool
 * This tool accepts orders and validates payments using order ID and transaction ID
 * Users can place orders and then validate their payments with transaction details
 */

// Mock order storage for accepted orders
let acceptedOrders: any[] = [];

export const acceptOrderTool = tool(
  async (args: {
    orderId: string;
    transactionId: string;
    amount: number;
    currency: string;
    customerInfo: {
      name: string;
      email: string;
      phone?: string;
    };
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    orderItems: Array<{
      itemId: string;
      name: string;
      quantity: number;
      price: number;
      specialInstructions?: string;
    }>;
    restaurantId: string;
    restaurantName: string;
    partnerRestaurant?: string;
  }): Promise<string> => {
    try {
      console.log(
        `📋 Accepting order ${args.orderId} with transaction ${args.transactionId}`
      );

      // Validate required fields
      if (!args.orderId || !args.transactionId || !args.amount) {
        return JSON.stringify({
          success: false,
          error:
            "Missing required fields: orderId, transactionId, and amount are required",
        });
      }

      if (args.amount <= 0) {
        return JSON.stringify({
          success: false,
          error: "Invalid order amount",
        });
      }

      // Process actual payment and deduct from agent's balance
      console.log(`🔍 Processing payment for order ${args.orderId}...`);

      // Use the balance manager to process the payment
      const paymentResult = await processPaymentTool.invoke({
        orderId: args.orderId,
        amount: args.amount,
        recipientAccountId: "0.0.123456", // Restaurant's account ID
        memo: `Payment for order ${args.orderId}`,
      });

      const paymentData = JSON.parse(paymentResult);

      if (!paymentData.success) {
        return JSON.stringify({
          success: false,
          error: "Payment processing failed",
          details: paymentData.error,
          orderId: args.orderId,
          transactionId: args.transactionId,
        });
      }

      console.log(
        `✅ Payment processed successfully: ${paymentData.transaction.id}`
      );
      console.log(`💰 New balance: ${paymentData.balance} HBAR`);

      // Create accepted order record
      const acceptedOrder = {
        orderId: args.orderId,
        transactionId: args.transactionId,
        amount: args.amount,
        currency: args.currency,
        customerInfo: args.customerInfo,
        deliveryAddress: args.deliveryAddress,
        orderItems: args.orderItems,
        restaurantId: args.restaurantId,
        restaurantName: args.restaurantName,
        partnerRestaurant: args.partnerRestaurant,
        status: "accepted",
        acceptedAt: new Date().toISOString(),
        estimatedDeliveryTime: "30-45 minutes",
        paymentStatus: "confirmed",
        paymentValidatedAt: new Date().toISOString(),
        paymentTransaction: paymentData.transaction,
        agentBalance: paymentData.balance,
      };

      // Store the accepted order
      acceptedOrders.push(acceptedOrder);

      console.log(`✅ Order ${args.orderId} accepted and payment validated`);

      return JSON.stringify({
        success: true,
        message: "Order accepted and payment validated successfully",
        order: acceptedOrder,
        paymentValidation: {
          transactionId: args.transactionId,
          amount: args.amount,
          currency: args.currency,
          status: "confirmed",
          validatedAt: new Date().toISOString(),
        },
        balance: {
          currentBalance: paymentData.balance,
          currency: "HBAR",
          transactionId: paymentData.transaction.id,
        },
      });
    } catch (error) {
      console.error("Order acceptance error:", error);
      return JSON.stringify({
        success: false,
        error: "Failed to accept order",
        details: error instanceof Error ? error.message : "Unknown error",
        orderId: args.orderId,
      });
    }
  },
  {
    name: "accept_order",
    description:
      "Accept an order and validate payment using order ID and transaction ID. This tool processes orders with payment validation for secure transactions.",
    schema: z.object({
      orderId: z.string().describe("The unique identifier of the order"),
      transactionId: z
        .string()
        .describe("The blockchain transaction ID for payment validation"),
      amount: z.number().describe("The payment amount"),
      currency: z
        .string()
        .describe("The currency used for payment (e.g., 'HBAR', 'USD')"),
      customerInfo: z.object({
        name: z.string().describe("Customer's full name"),
        email: z.string().describe("Customer's email address"),
        phone: z.string().optional().describe("Customer's phone number"),
      }),
      deliveryAddress: z.object({
        street: z.string().describe("Street address"),
        city: z.string().describe("City"),
        state: z.string().describe("State/Province"),
        zipCode: z.string().describe("ZIP/Postal code"),
        country: z.string().describe("Country"),
      }),
      orderItems: z.array(
        z.object({
          itemId: z.string().describe("Unique identifier for the menu item"),
          name: z.string().describe("Name of the menu item"),
          quantity: z.number().describe("Quantity ordered"),
          price: z.number().describe("Price per item"),
          specialInstructions: z
            .string()
            .optional()
            .describe("Special instructions for the item"),
        })
      ),
      restaurantId: z
        .string()
        .describe("The unique identifier of the restaurant"),
      restaurantName: z.string().describe("The name of the restaurant"),
      partnerRestaurant: z
        .string()
        .optional()
        .describe("Partner restaurant name (e.g., 'Pizza Hut', 'McDonald's')"),
    }),
  }
);

export const validatePaymentTool = tool(
  async (args: { orderId: string; transactionId: string }): Promise<string> => {
    try {
      console.log(
        `🔍 Validating payment for order ${args.orderId} with transaction ${args.transactionId}`
      );

      // Find the order
      const order = acceptedOrders.find((o) => o.orderId === args.orderId);

      if (!order) {
        return JSON.stringify({
          success: false,
          error: "Order not found",
          orderId: args.orderId,
        });
      }

      // Check if transaction ID matches
      if (order.transactionId !== args.transactionId) {
        return JSON.stringify({
          success: false,
          error: "Transaction ID mismatch",
          orderId: args.orderId,
          providedTransactionId: args.transactionId,
          expectedTransactionId: order.transactionId,
        });
      }

      // In a real implementation, this would verify the transaction on the blockchain
      console.log(
        `🔍 Verifying transaction ${args.transactionId} on blockchain...`
      );

      // Simulate blockchain verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const paymentValidation = {
        orderId: args.orderId,
        transactionId: args.transactionId,
        amount: order.amount,
        currency: order.currency,
        status: "confirmed",
        confirmedAt: new Date().toISOString(),
        blockHeight: Math.floor(Math.random() * 1000000) + 1000000,
        confirmations: 6,
        network: "Hedera Testnet",
      };

      console.log(`✅ Payment validation successful for order ${args.orderId}`);

      return JSON.stringify({
        success: true,
        message: "Payment validation successful",
        order: order,
        paymentValidation: paymentValidation,
      });
    } catch (error) {
      console.error("Payment validation error:", error);
      return JSON.stringify({
        success: false,
        error: "Failed to validate payment",
        details: error instanceof Error ? error.message : "Unknown error",
        orderId: args.orderId,
        transactionId: args.transactionId,
      });
    }
  },
  {
    name: "validate_payment",
    description:
      "Validate a payment for an order using order ID and transaction ID. This tool verifies blockchain transactions and confirms payment status.",
    schema: z.object({
      orderId: z.string().describe("The unique identifier of the order"),
      transactionId: z
        .string()
        .describe("The blockchain transaction ID to validate"),
    }),
  }
);

export const getAcceptedOrderStatusTool = tool(
  async (args: { orderId: string }): Promise<string> => {
    try {
      console.log(`📋 Getting status for order ${args.orderId}`);

      const order = acceptedOrders.find((o) => o.orderId === args.orderId);

      if (!order) {
        return JSON.stringify({
          success: false,
          error: "Order not found",
          orderId: args.orderId,
        });
      }

      // Generate order status with delivery updates
      const statusUpdates = [
        {
          status: "accepted",
          timestamp: order.acceptedAt,
          message: "Order accepted and payment confirmed",
        },
        {
          status: "preparing",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          message: "Restaurant is preparing your order",
        },
        {
          status: "ready",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          message: "Order is ready for pickup/delivery",
        },
      ];

      return JSON.stringify({
        success: true,
        order: order,
        statusUpdates: statusUpdates,
        currentStatus: "preparing",
        estimatedDeliveryTime: order.estimatedDeliveryTime,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: "Failed to get order status",
        details: error instanceof Error ? error.message : "Unknown error",
        orderId: args.orderId,
      });
    }
  },
  {
    name: "get_accepted_order_status",
    description:
      "Get the current status and tracking information for an accepted order",
    schema: z.object({
      orderId: z.string().describe("The unique identifier of the order"),
    }),
  }
);

export const cancelOrderTool = tool(
  async (args: {
    orderId: string;
    reason: string;
    refundTransactionId?: string;
  }): Promise<string> => {
    try {
      console.log(
        `❌ Cancelling order ${args.orderId} - Reason: ${args.reason}`
      );

      const orderIndex = acceptedOrders.findIndex(
        (o) => o.orderId === args.orderId
      );

      if (orderIndex === -1) {
        return JSON.stringify({
          success: false,
          error: "Order not found",
          orderId: args.orderId,
        });
      }

      const order = acceptedOrders[orderIndex];

      // Update order status
      order.status = "cancelled";
      order.cancelledAt = new Date().toISOString();
      order.cancellationReason = args.reason;

      if (args.refundTransactionId) {
        order.refundTransactionId = args.refundTransactionId;
        order.refundStatus = "processed";
      }

      console.log(`✅ Order ${args.orderId} cancelled successfully`);

      return JSON.stringify({
        success: true,
        message: "Order cancelled successfully",
        order: order,
        cancellation: {
          reason: args.reason,
          cancelledAt: order.cancelledAt,
          refundTransactionId: args.refundTransactionId,
        },
      });
    } catch (error) {
      console.error("Order cancellation error:", error);
      return JSON.stringify({
        success: false,
        error: "Failed to cancel order",
        details: error instanceof Error ? error.message : "Unknown error",
        orderId: args.orderId,
      });
    }
  },
  {
    name: "cancel_order",
    description: "Cancel an accepted order and process refund if applicable",
    schema: z.object({
      orderId: z
        .string()
        .describe("The unique identifier of the order to cancel"),
      reason: z.string().describe("Reason for cancellation"),
      refundTransactionId: z
        .string()
        .optional()
        .describe("Transaction ID for refund processing"),
    }),
  }
);
