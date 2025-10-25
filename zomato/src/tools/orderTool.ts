import { tool } from "langchain";
import { z } from "zod";
import {
  Order,
  OrderRequest,
  OrderResponse,
  OrderStatus,
  OrderStatusRequest,
  OrderStatusResponse,
  DeliveryUpdate,
  OrderItem,
} from "../types";
import { processPaymentTool } from "./paymentTool";
import { processAgentPaymentTool } from "./agentPaymentTool";

// Mock order storage (in a real app, this would be a database)
let mockOrders: Order[] = [];
let orderCounter = 1;

// Mock restaurant data for order validation
const mockRestaurants = [
  {
    id: "rest_001",
    name: "Pizza Palace",
    minimumOrder: 15.0,
    deliveryFee: 2.99,
  },
  {
    id: "rest_002",
    name: "Burger Barn",
    minimumOrder: 12.0,
    deliveryFee: 1.99,
  },
  {
    id: "rest_003",
    name: "Sushi Express",
    minimumOrder: 20.0,
    deliveryFee: 3.99,
  },
];

// Mock menu items for price calculation
const mockMenuItems: { [key: string]: { price: number; name: string } } = {
  item_001: { price: 14.99, name: "Margherita Pizza" },
  item_002: { price: 16.99, name: "Pepperoni Pizza" },
  item_003: { price: 6.99, name: "Garlic Bread" },
  item_004: { price: 2.99, name: "Coca Cola" },
  item_005: { price: 8.99, name: "Tiramisu" },
  item_006: { price: 12.99, name: "Classic Cheeseburger" },
  item_007: { price: 15.99, name: "Bacon Deluxe Burger" },
  item_008: { price: 4.99, name: "French Fries" },
  item_009: { price: 5.99, name: "Onion Rings" },
  item_010: { price: 6.99, name: "Chocolate Milkshake" },
  item_011: { price: 8.99, name: "California Roll" },
  item_012: { price: 12.99, name: "Salmon Sashimi" },
  item_013: { price: 14.99, name: "Dragon Roll" },
  item_014: { price: 3.99, name: "Miso Soup" },
  item_015: { price: 2.99, name: "Green Tea" },
};

export const placeOrderTool = tool(
  async (
    args: OrderRequest & {
      userPrivateKey?: string;
      partnerRestaurant?: string;
      partnerOrderId?: string;
    }
  ): Promise<string> => {
    try {
      // Validate restaurant exists
      const restaurant = mockRestaurants.find(
        (r) => r.id === args.restaurantId
      );
      if (!restaurant) {
        return JSON.stringify({
          error: "Restaurant not found",
          restaurantId: args.restaurantId,
        });
      }

      // Validate and calculate order total
      let subtotal = 0;
      const validatedItems: OrderItem[] = [];

      for (const item of args.items) {
        const menuItem = mockMenuItems[item.menuItemId];
        if (!menuItem) {
          return JSON.stringify({
            error: "Menu item not found",
            menuItemId: item.menuItemId,
          });
        }

        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        validatedItems.push({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions,
        });
      }

      // Check minimum order requirement
      if (subtotal < restaurant.minimumOrder) {
        return JSON.stringify({
          error: "Order total below minimum",
          subtotal: subtotal,
          minimumOrder: restaurant.minimumOrder,
        });
      }

      // Calculate fees and tax
      const deliveryFee = restaurant.deliveryFee;
      const tax = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + deliveryFee + tax;

      // Create order
      const order: Order = {
        id: `order_${orderCounter++}`,
        restaurantId: args.restaurantId,
        restaurantName: restaurant.name,
        customerId: "customer_001", // In real app, this would come from authentication
        items: validatedItems,
        totalAmount: totalAmount,
        deliveryFee: deliveryFee,
        tax: tax,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: "30-45 mins",
        deliveryAddress: args.deliveryAddress,
        paymentMethod: args.paymentMethod,
        specialInstructions: args.specialInstructions,
        partnerRestaurant: args.partnerRestaurant,
        partnerOrderId: args.partnerOrderId,
      };

      // Store order
      mockOrders.push(order);

      // Process payment using agent-to-agent payment system
      let paymentResult = null;
      if (args.paymentMethod === "crypto") {
        try {
          console.log(
            "💳 Processing agent-to-agent payment for order:",
            order.id
          );

          // Convert USD to HBAR (simplified conversion rate)
          const hbarAmount = totalAmount * 0.1; // 1 USD = 0.1 HBAR (example rate)

          // Determine partner agent URL based on restaurant
          let partnerAgentUrl = null;
          if (args.partnerRestaurant === "Pizza Hut") {
            partnerAgentUrl = "http://localhost:3001";
          } else if (args.partnerRestaurant === "McDonald's") {
            partnerAgentUrl = "http://localhost:3002";
          } else {
            // Default to Pizza Hut for regular restaurants
            partnerAgentUrl = "http://localhost:3001";
          }

          console.log(
            `🤝 Sending payment to partner agent: ${partnerAgentUrl}`
          );

          const paymentResponse = await processAgentPaymentTool.invoke({
            orderId: order.id,
            amount: hbarAmount,
            partnerAgentUrl: partnerAgentUrl,
            memo: `Agent-to-agent payment for order ${order.id} at ${restaurant.name}`,
          });

          const paymentData = JSON.parse(paymentResponse);
          if (paymentData.success) {
            paymentResult = paymentData;
            order.status = OrderStatus.CONFIRMED;
            console.log("✅ Agent-to-agent payment processed successfully");
          } else {
            console.error("❌ Agent payment failed:", paymentData.error);
            return JSON.stringify({
              error: "Agent payment processing failed",
              details: paymentData.error,
              order: order,
            });
          }
        } catch (paymentError) {
          console.error("Agent payment processing error:", paymentError);
          return JSON.stringify({
            error: "Agent payment processing failed",
            details:
              paymentError instanceof Error
                ? paymentError.message
                : "Unknown payment error",
            order: order,
          });
        }
      }

      const response: OrderResponse = {
        order: order,
        success: true,
        message: "Order placed successfully",
        payment: paymentResult,
        partnerOrderId: args.partnerOrderId,
      };

      return JSON.stringify(response);
    } catch (error) {
      return JSON.stringify({
        error: "Failed to place order",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "place_order",
    description:
      "Place a food order with a restaurant. Validates order items, calculates total cost including tax and delivery fee, processes payment if private key provided, and creates the order. Supports partner restaurant integration with Pizza Hut and McDonald's.",
    schema: z.object({
      restaurantId: z
        .string()
        .describe("The unique identifier of the restaurant"),
      items: z
        .array(
          z.object({
            menuItemId: z.string(),
            name: z.string(),
            quantity: z.number(),
            price: z.number(),
            specialInstructions: z.string().optional(),
          })
        )
        .describe("Array of items to order"),
      deliveryAddress: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
          address: z.string().optional(),
          city: z.string().optional(),
          zipCode: z.string().optional(),
        })
        .describe("Delivery address"),
      paymentMethod: z
        .string()
        .describe("Payment method (e.g., 'credit_card', 'cash', 'crypto')"),
      specialInstructions: z
        .string()
        .optional()
        .describe("Special delivery instructions"),
      userPrivateKey: z
        .string()
        .optional()
        .describe(
          "User's private key for crypto payments (deprecated - now uses agent-to-agent payments)"
        ),
      partnerRestaurant: z
        .string()
        .optional()
        .describe("Partner restaurant name (e.g., 'Pizza Hut', 'McDonald's')"),
      partnerOrderId: z
        .string()
        .optional()
        .describe("Order ID from partner restaurant (Pizza Hut/McDonald's)"),
    }),
  }
);

export const getOrderStatusTool = tool(
  async (args: OrderStatusRequest): Promise<string> => {
    try {
      const order = mockOrders.find((o) => o.id === args.orderId);

      if (!order) {
        return JSON.stringify({
          error: "Order not found",
          orderId: args.orderId,
        });
      }

      // Generate mock delivery updates based on order status
      const updates: DeliveryUpdate[] = [
        {
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          timestamp: order.createdAt,
          message: "Order confirmed and sent to restaurant",
        },
      ];

      if (
        order.status === OrderStatus.PREPARING ||
        order.status === OrderStatus.READY_FOR_PICKUP ||
        order.status === OrderStatus.OUT_FOR_DELIVERY ||
        order.status === OrderStatus.DELIVERED
      ) {
        updates.push({
          orderId: order.id,
          status: OrderStatus.PREPARING,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          message: "Restaurant is preparing your order",
        });
      }

      if (
        order.status === OrderStatus.READY_FOR_PICKUP ||
        order.status === OrderStatus.OUT_FOR_DELIVERY ||
        order.status === OrderStatus.DELIVERED
      ) {
        updates.push({
          orderId: order.id,
          status: OrderStatus.READY_FOR_PICKUP,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          message: "Order is ready for pickup",
        });
      }

      if (
        order.status === OrderStatus.OUT_FOR_DELIVERY ||
        order.status === OrderStatus.DELIVERED
      ) {
        updates.push({
          orderId: order.id,
          status: OrderStatus.OUT_FOR_DELIVERY,
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          message: "Order is out for delivery",
          estimatedTime: "10-15 mins",
        });
      }

      if (order.status === OrderStatus.DELIVERED) {
        updates.push({
          orderId: order.id,
          status: OrderStatus.DELIVERED,
          timestamp: new Date().toISOString(),
          message: "Order has been delivered",
        });
      }

      const response: OrderStatusResponse = {
        order: order,
        updates: updates,
      };

      return JSON.stringify(response);
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get order status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_order_status",
    description: "Get the current status and tracking information for an order",
    schema: z.object({
      orderId: z.string().describe("The unique identifier of the order"),
    }),
  }
);

export const updateOrderStatusTool = tool(
  async (args: {
    orderId: string;
    status: string;
    message?: string;
  }): Promise<string> => {
    try {
      const order = mockOrders.find((o) => o.id === args.orderId);

      if (!order) {
        return JSON.stringify({
          error: "Order not found",
          orderId: args.orderId,
        });
      }

      // Update order status
      order.status = args.status as OrderStatus;

      // Add status update to order history
      const update: DeliveryUpdate = {
        orderId: order.id,
        status: order.status,
        timestamp: new Date().toISOString(),
        message: args.message || `Order status updated to ${args.status}`,
      };

      return JSON.stringify({
        success: true,
        order: order,
        update: update,
        message: "Order status updated successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to update order status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "update_order_status",
    description:
      "Update the status of an order (for restaurant/delivery agent use)",
    schema: z.object({
      orderId: z.string().describe("The unique identifier of the order"),
      status: z
        .enum([
          "pending",
          "confirmed",
          "preparing",
          "ready_for_pickup",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ])
        .describe("New status for the order"),
      message: z.string().optional().describe("Status update message"),
    }),
  }
);
