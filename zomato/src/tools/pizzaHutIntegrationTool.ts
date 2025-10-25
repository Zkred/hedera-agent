import { tool } from "langchain";
import { z } from "zod";
import { SimpleA2AClient } from "../simpleA2AClient";

/**
 * Tool for integrating with Pizza Hut agent
 * This tool allows the Zomato agent to communicate with Pizza Hut agent
 * for pizza orders, customization, loyalty programs, and promotional offers
 */

export const pizzaHutIntegrationTool = tool(
  async (args: { message: string }): Promise<string> => {
    try {
      // Pizza Hut agent runs on port 3001
      const pizzaHutClient = new SimpleA2AClient("http://localhost:3001");

      console.log(`🍕 Sending message to Pizza Hut agent: ${args.message}`);

      // Add timeout to prevent infinite loops
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error("Request timeout - Pizza Hut agent not responding")
            ),
          10000
        );
      });

      const responsePromise = pizzaHutClient.sendMessage(args.message);
      const response = await Promise.race([responsePromise, timeoutPromise]);

      console.log(`🍕 Pizza Hut agent response: ${response}`);

      // Extract order ID from response if it contains order information
      let orderId = null;
      try {
        const responseObj = JSON.parse(response as string);
        if (responseObj.orderId) {
          orderId = responseObj.orderId;
        } else if (responseObj.order && responseObj.order.id) {
          orderId = responseObj.order.id;
        }
      } catch (e) {
        // If response is not JSON, try to extract order ID from text
        if (typeof response === "string") {
          const orderIdMatch = response.match(
            /order[_-]?id[:\s]*([a-zA-Z0-9_-]+)/i
          );
          if (orderIdMatch) {
            orderId = orderIdMatch[1];
          }
        }
      }

      return JSON.stringify({
        success: true,
        response: response,
        agent: "Pizza Hut",
        orderId: orderId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error communicating with Pizza Hut agent:", error);

      // Check if it's a connection error
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("ECONNREFUSED") ||
          error.message.includes("timeout") ||
          error.message.includes("not responding"));

      if (isConnectionError) {
        console.log(
          "🍕 Pizza Hut agent is not running. Please start the Pizza Hut agent on port 3001"
        );
      }

      // Provide fallback response when Pizza Hut agent is not available
      const fallbackResponse = `I'm sorry, but the Pizza Hut agent is currently not available. However, I can help you with Pizza Hut information directly:

🍕 **Pizza Hut Menu Items Available:**
• **Pizzas:** Supreme, Meat Lover's, Veggie Lover's, Pepperoni, Margherita
• **Crust Options:** Hand Tossed, Thin 'N Crispy, Stuffed Crust, Pan Pizza
• **Sizes:** Personal (6"), Medium (10"), Large (12"), Extra Large (14")
• **Wings:** Buffalo, BBQ, Honey BBQ, Spicy Buffalo (6, 12, or 24 pieces)
• **Sides:** Breadsticks, Cinnamon Sticks, Pasta, Salads
• **Desserts:** Chocolate Chip Cookie, Cinnamon Sticks, Brownie

🍕 **Special Features:**
• Custom pizza builder with unlimited toppings
• Online ordering and delivery
• Loyalty rewards program (earn points on every order)
• Promotional codes and special offers
• Group orders and catering options

🍕 **Popular Combos:**
• Supreme Pizza + Wings + Breadsticks
• Meat Lover's Pizza + 2-Liter Drink
• Veggie Lover's Pizza + Salad

Would you like to know more about any specific items, create a custom pizza, or check for current promotions?`;

      return JSON.stringify({
        success: false,
        response: fallbackResponse,
        agent: "Pizza Hut (Fallback)",
        error: `Pizza Hut agent unavailable: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }
  },
  {
    name: "pizza_hut_integration",
    description:
      "Communicate with Pizza Hut agent for pizza customization, menu information, loyalty programs, and promotional offers. This tool gets information from Pizza Hut but does NOT place orders - use Zomato's order system instead.",
    schema: z.object({
      message: z
        .string()
        .describe(
          "The message to send to Pizza Hut agent. Should be a natural language request for Pizza Hut services like 'I want to customize a pizza' or 'Check my loyalty points'"
        ),
    }),
  }
);

/**
 * Tool for getting Pizza Hut agent capabilities
 */
export const getPizzaHutCapabilitiesTool = tool(
  async (): Promise<string> => {
    try {
      const pizzaHutClient = new SimpleA2AClient("http://localhost:3001");

      console.log("🍕 Getting Pizza Hut agent capabilities...");

      const agentCard = await pizzaHutClient.getAgentCard();

      return JSON.stringify({
        success: true,
        capabilities: agentCard,
        agent: "Pizza Hut",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting Pizza Hut agent capabilities:", error);
      return JSON.stringify({
        success: false,
        error: `Failed to get Pizza Hut agent capabilities: ${error}`,
        agent: "Pizza Hut",
        timestamp: new Date().toISOString(),
      });
    }
  },
  {
    name: "get_pizza_hut_capabilities",
    description:
      "Get information about Pizza Hut agent capabilities and services",
    schema: z.object({}),
  }
);
