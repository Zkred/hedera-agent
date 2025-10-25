// src/agentCard.ts
import type { AgentCard } from "@a2a-js/sdk";
import { ChainConfigManager } from "./utils/chainConfig";

// Extend the AgentCard type to include chain configuration
interface ExtendedAgentCard extends AgentCard {
  chainConfig?: {
    agentId: string;
    chainId: number;
    description: string;
    serviceEndpoint: string;
    publicKey: string;
    registeredAt: string;
    did: string;
  };
}

// Create a function to generate the agent card with chain config
export const createMcDonaldsAgentCard =
  async (): Promise<ExtendedAgentCard> => {
    const chainConfigManager = new ChainConfigManager();
    const chainConfig = await chainConfigManager.loadConfig();

    return {
      name: "McDonald's Delivery Agent",
      description:
        "A specialized fast food delivery agent that can take orders, manage combo meals, handle drive-thru slots, and process payments. Integrates with Hedera network for secure transactions and identity management.",
      protocolVersion: "0.3.0",
      version: "1.0.0",
      url: process.env.AGENT_URL || "http://localhost:3002/",
      chainConfig: chainConfig
        ? {
            agentId: chainConfig.agentId || "Not yet registered",
            chainId: chainConfig.chainId,
            description: chainConfig.description,
            serviceEndpoint: chainConfig.serviceEndpoint,
            publicKey: chainConfig.publicKey || "Not yet generated",
            registeredAt: chainConfig.registeredAt,
            did: chainConfig.did || "Not yet generated",
          }
        : undefined,
      skills: [
        {
          id: "combo-meals",
          name: "Combo Meal Management",
          description:
            "Create and manage McDonald's combo meals with customizable options and pricing",
          tags: ["combo", "meals", "menu", "fast-food"],
        },
        {
          id: "drive-thru",
          name: "Drive-Thru Management",
          description:
            "Manage drive-thru slots, wait times, and pickup scheduling",
          tags: ["drive-thru", "pickup", "scheduling", "convenience"],
        },
        {
          id: "nutritional-info",
          name: "Nutritional Information",
          description:
            "Provide detailed nutritional information for all menu items",
          tags: ["nutrition", "health", "calories", "allergens"],
        },
        {
          id: "mc-delivery-rewards",
          name: "McDelivery Rewards",
          description:
            "Manage McDonald's delivery rewards program and points system",
          tags: ["rewards", "points", "loyalty", "delivery"],
        },
        {
          id: "order-tracking",
          name: "Order Tracking",
          description:
            "Track fast food orders from preparation to delivery with real-time updates",
          tags: ["tracking", "delivery", "status", "updates"],
        },
        {
          id: "hedera-operations",
          name: "Hedera Operations",
          description:
            "Perform secure blockchain operations for payments and identity verification",
          tags: ["blockchain", "hedera", "payments", "security"],
        },
        {
          id: "chat",
          name: "Customer Support",
          description:
            "Provide customer support and assistance with McDonald's orders and delivery",
          tags: ["support", "chat", "assistance", "help"],
        },
      ],
      capabilities: {
        streaming: true,
        pushNotifications: true,
        stateTransitionHistory: true,
      },
      defaultInputModes: ["text/plain", "application/json"],
      defaultOutputModes: ["text/plain", "application/json"],
    };
  };

// Keep the original export for backward compatibility
export const mcdonaldsAgentCard: AgentCard = {
  name: "McDonald's Delivery Agent",
  description:
    "A specialized fast food delivery agent that can take orders, manage combo meals, handle drive-thru slots, and process payments. Integrates with Hedera network for secure transactions and identity management.",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: process.env.AGENT_URL || "http://localhost:3002/",
  skills: [
    {
      id: "combo-meals",
      name: "Combo Meal Management",
      description:
        "Create and manage McDonald's combo meals with customizable options and pricing",
      tags: ["combo", "meals", "menu", "fast-food"],
    },
    {
      id: "drive-thru",
      name: "Drive-Thru Management",
      description: "Manage drive-thru slots, wait times, and pickup scheduling",
      tags: ["drive-thru", "pickup", "scheduling", "convenience"],
    },
    {
      id: "nutritional-info",
      name: "Nutritional Information",
      description:
        "Provide detailed nutritional information for all menu items",
      tags: ["nutrition", "health", "calories", "allergens"],
    },
    {
      id: "mc-delivery-rewards",
      name: "McDelivery Rewards",
      description:
        "Manage McDonald's delivery rewards program and points system",
      tags: ["rewards", "points", "loyalty", "delivery"],
    },
    {
      id: "order-tracking",
      name: "Order Tracking",
      description:
        "Track fast food orders from preparation to delivery with real-time updates",
      tags: ["tracking", "delivery", "status", "updates"],
    },
    {
      id: "hedera-operations",
      name: "Hedera Operations",
      description:
        "Perform secure blockchain operations for payments and identity verification",
      tags: ["blockchain", "hedera", "payments", "security"],
    },
    {
      id: "chat",
      name: "Customer Support",
      description:
        "Provide customer support and assistance with McDonald's orders and delivery",
      tags: ["support", "chat", "assistance", "help"],
    },
  ],
  capabilities: {
    streaming: true,
    pushNotifications: true,
    stateTransitionHistory: true,
  },
  defaultInputModes: ["text/plain", "application/json"],
  defaultOutputModes: ["text/plain", "application/json"],
};
