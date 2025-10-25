import { tool } from "langchain";
import { z } from "zod";
import { SimpleA2AClient } from "../simpleA2AClient";
import { zkredAgentIdPlugin } from "@zkred/hedera-agentid-plugin";

/**
 * Tool for integrating with McDonald's agent
 * This tool allows the Zomato agent to communicate with McDonald's agent
 * for fast food orders, combo meals, drive-thru, and McDelivery rewards
 */

export const mcdonaldsIntegrationTool = tool(
  async (args: { message: string }): Promise<string> => {
    try {
      // Get environment variables
      const zomatoPrivateKey = process.env.HEDERA_PRIVATE_KEY;
      const zomatoChainId = 296;

      if (!zomatoPrivateKey) {
        throw new Error(
          "Missing required environment variable: ZOMATO_PRIVATE_KEY"
        );
      }

      // Get Zomato's DID from agent card
      const zomatoClient = new SimpleA2AClient("http://localhost:3000");
      const zomatoAgentCard = await zomatoClient.getAgentCard();
      const zomatoDid = zomatoAgentCard.chainConfig?.did;

      if (!zomatoDid) {
        throw new Error("Zomato DID not found in agent card");
      }

      // Get McDonald's DID from their agent card
      const mcdonaldsClient = new SimpleA2AClient("http://localhost:3002");
      const mcdonaldsAgentCard = await mcdonaldsClient.getAgentCard();
      const mcdonaldsDid = mcdonaldsAgentCard.chainConfig?.did;

      if (!mcdonaldsDid) {
        throw new Error("McDonald's DID not found in agent card");
      }

      // Get plugin tools
      const tools = zkredAgentIdPlugin.tools({});
      const initiateHandshakeTool = tools.find(
        (tool: any) => tool.method === "initiate_agent_handshake"
      );
      const completeHandshakeTool = tools.find(
        (tool: any) => tool.method === "complete_agent_handshake"
      );

      if (!initiateHandshakeTool || !completeHandshakeTool) {
        throw new Error("Handshake tools not found");
      }

      // Establish handshake with McDonald's
      console.log(
        `🤝 Initiating handshake with McDonald's (DID: ${mcdonaldsDid})...`
      );

      const mcdonaldsHandshake = await initiateHandshakeTool.execute(
        null, // client
        {}, // context
        {
          initiatorDid: zomatoDid,
          initiatorChainId: zomatoChainId,
          receiverDid: mcdonaldsDid,
          receiverChainId: 296,
        }
      );

      console.log("McDonald's handshake result:", mcdonaldsHandshake);

      if (!mcdonaldsHandshake.success) {
        throw new Error(
          `Failed to initiate handshake with McDonald's: ${
            mcdonaldsHandshake.error || "Unknown error"
          }`
        );
      }

      const mcdonaldsComplete = await completeHandshakeTool.execute(
        null, // client
        {}, // context
        {
          privateKey: zomatoPrivateKey,
          sessionId: mcdonaldsHandshake.handshake.sessionId.toString(),
          receiverAgentCallbackEndPoint: `${mcdonaldsAgentCard.chainConfig?.serviceEndpoint}completeHandshake`,
          challenge: mcdonaldsHandshake.handshake.challenge,
        }
      );

      console.log(
        "🔍 McDonald's complete handshake result:",
        mcdonaldsComplete
      );

      if (!mcdonaldsComplete.success || !mcdonaldsComplete.handshakeCompleted) {
        console.error("❌ McDonald's handshake completion failed:", {
          success: mcdonaldsComplete.success,
          handshakeCompleted: mcdonaldsComplete.handshakeCompleted,
        });
        throw new Error("Failed to complete handshake with McDonald's");
      }

      const sessionId = mcdonaldsHandshake.handshake.sessionId;
      console.log(
        `🤝 McDonald's handshake completed! Session ID: ${sessionId}`
      );

      // McDonald's agent runs on port 3002

      console.log(`🍟 Sending message to McDonald's agent: ${args.message}`);

      // Add timeout to prevent infinite loops
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error("Request timeout - McDonald's agent not responding")
            ),
          10000
        );
      });

      const responsePromise = mcdonaldsClient.sendMessage(
        args.message,
        sessionId.toString()
      );
      const response = await Promise.race([responsePromise, timeoutPromise]);

      console.log(`🍟 McDonald's agent response: ${response}`);

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
        agent: "McDonald's",
        orderId: orderId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error communicating with McDonald's agent:", error);

      // Provide fallback response when McDonald's agent is not available
      const fallbackResponse = `I'm sorry, but the McDonald's agent is currently not available. However, I can help you with McDonald's information directly:

🍟 **McDonald's Menu Items Available:**
• **Burgers:** Big Mac, Quarter Pounder, McDouble, Cheeseburger
• **Chicken:** McChicken, McNuggets (6, 10, or 20 pieces), McChicken Deluxe
• **Breakfast:** Egg McMuffin, Sausage McMuffin, Hotcakes, Hash Browns
• **Sides:** French Fries (Small, Medium, Large), Apple Slices, Side Salad
• **Beverages:** Coca-Cola, Sprite, Fanta, Coffee, Milkshakes, Smoothies
• **Desserts:** Apple Pie, McFlurry, Sundaes, Cookies

🍟 **Popular Combos:**
• Big Mac Meal (Big Mac + Fries + Drink)
• Quarter Pounder Meal
• McNuggets Meal (6, 10, or 20 pieces)
• McChicken Meal

🍟 **Special Features:**
• Drive-thru service available
• McDelivery for home delivery
• Mobile ordering and payment
• Loyalty rewards program

Would you like to know more about any specific items or place an order?`;

      return JSON.stringify({
        success: false,
        response: fallbackResponse,
        agent: "McDonald's (Fallback)",
        error: `McDonald's agent unavailable: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }
  },
  {
    name: "mcdonalds_integration",
    description:
      "Communicate with McDonald's agent for menu information, combo meals, drive-thru availability, and McDelivery rewards. This tool gets information from McDonald's but does NOT place orders - use Zomato's order system instead.",
    schema: z.object({
      message: z
        .string()
        .describe(
          "The message to send to McDonald's agent. Should be a natural language request for McDonald's services like 'Show me Big Mac combo options' or 'Check drive-thru availability'"
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
