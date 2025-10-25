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
      // Pizza Hut agent typically runs on port 3002
      const pizzaHutClient = new SimpleA2AClient("http://localhost:3002");

      console.log(`🍕 Sending message to Pizza Hut agent: ${args.message}`);

      const response = await pizzaHutClient.sendMessage(args.message);

      console.log(`🍕 Pizza Hut agent response: ${response}`);

      return JSON.stringify({
        success: true,
        response: response,
        agent: "Pizza Hut",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error communicating with Pizza Hut agent:", error);
      return JSON.stringify({
        success: false,
        error: `Failed to communicate with Pizza Hut agent: ${error}`,
        agent: "Pizza Hut",
        timestamp: new Date().toISOString(),
      });
    }
  },
  {
    name: "pizza_hut_integration",
    description:
      "Communicate with Pizza Hut agent for pizza orders, customization, loyalty programs, and promotional offers. Use this when users mention Pizza Hut, pizza, offers, loyalty points, or promotional codes.",
    schema: z.object({
      message: z
        .string()
        .describe(
          "The message to send to Pizza Hut agent. Should be a natural language request for Pizza Hut services like 'I want to create a custom pizza' or 'Check my loyalty points'"
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
      const pizzaHutClient = new SimpleA2AClient("http://localhost:3002");

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
