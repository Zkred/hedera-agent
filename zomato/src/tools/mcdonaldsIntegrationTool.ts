import { tool } from "langchain";
import { z } from "zod";
import { SimpleA2AClient } from "../simpleA2AClient";

/**
 * Tool for integrating with McDonald's agent
 * This tool allows the Zomato agent to communicate with McDonald's agent
 * for fast food orders, combo meals, drive-thru, and McDelivery rewards
 */

export const mcdonaldsIntegrationTool = tool(
  async (args: { message: string }): Promise<string> => {
    try {
      // McDonald's agent typically runs on port 3001
      const mcdonaldsClient = new SimpleA2AClient("http://localhost:3001");

      console.log(`🍟 Sending message to McDonald's agent: ${args.message}`);

      const response = await mcdonaldsClient.sendMessage(args.message);

      console.log(`🍟 McDonald's agent response: ${response}`);

      return JSON.stringify({
        success: true,
        response: response,
        agent: "McDonald's",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error communicating with McDonald's agent:", error);
      return JSON.stringify({
        success: false,
        error: `Failed to communicate with McDonald's agent: ${error}`,
        agent: "McDonald's",
        timestamp: new Date().toISOString(),
      });
    }
  },
  {
    name: "mcdonalds_integration",
    description:
      "Communicate with McDonald's agent for fast food orders, combo meals, drive-thru reservations, and McDelivery rewards. Use this when users mention McDonald's, Big Mac, fries, drive-thru, or McDelivery.",
    schema: z.object({
      message: z
        .string()
        .describe(
          "The message to send to McDonald's agent. Should be a natural language request for McDonald's services like 'I want to order a Big Mac combo' or 'Check drive-thru availability'"
        ),
    }),
  }
);

/**
 * Tool for getting McDonald's agent capabilities
 */
export const getMcdonaldsCapabilitiesTool = tool(
  async (): Promise<string> => {
    try {
      const mcdonaldsClient = new SimpleA2AClient("http://localhost:3001");

      console.log("🍟 Getting McDonald's agent capabilities...");

      const agentCard = await mcdonaldsClient.getAgentCard();

      return JSON.stringify({
        success: true,
        capabilities: agentCard,
        agent: "McDonald's",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting McDonald's agent capabilities:", error);
      return JSON.stringify({
        success: false,
        error: `Failed to get McDonald's agent capabilities: ${error}`,
        agent: "McDonald's",
        timestamp: new Date().toISOString(),
      });
    }
  },
  {
    name: "get_mcdonalds_capabilities",
    description:
      "Get information about McDonald's agent capabilities and services",
    schema: z.object({}),
  }
);
