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
export const createPizzaHutAgentCard = async (): Promise<ExtendedAgentCard> => {
  const chainConfigManager = new ChainConfigManager();
  const chainConfig = await chainConfigManager.loadConfig();

  return {
    name: "Pizza Hut Delivery Agent",
    description:
      "A specialized pizza delivery agent that can take orders, customize pizzas, manage loyalty programs, and process payments. Integrates with Hedera network for secure transactions and identity management.",
    protocolVersion: "0.3.0",
    version: "1.0.0",
    url: process.env.AGENT_URL || "http://localhost:3001/",
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
        id: "pizza-customization",
        name: "Pizza Customization",
        description:
          "Create custom pizzas with various sizes, crusts, sauces, cheeses, and toppings",
        tags: ["pizza", "customization", "menu", "personalization"],
      },
      {
        id: "loyalty-program",
        name: "Loyalty Program",
        description:
          "Manage customer loyalty points, rewards, and tier benefits",
        tags: ["loyalty", "rewards", "points", "customer-retention"],
      },
      {
        id: "promo-management",
        name: "Promo Management",
        description: "Handle promotional codes, discounts, and special offers",
        tags: ["promotions", "discounts", "offers", "marketing"],
      },
      {
        id: "order-tracking",
        name: "Order Tracking",
        description:
          "Track pizza orders from preparation to delivery with real-time updates",
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
          "Provide customer support and assistance with pizza orders and delivery",
        tags: ["support", "chat", "assistance", "help"],
      },
      {
        id: "handshake",
        name: "Agent Handshake",
        description:
          "Initiate and complete secure handshakes with other agents for authenticated communication",
        tags: [
          "handshake",
          "authentication",
          "security",
          "agent-communication",
        ],
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
export const pizzaHutAgentCard: AgentCard = {
  name: "Pizza Hut Delivery Agent",
  description:
    "A specialized pizza delivery agent that can take orders, customize pizzas, manage loyalty programs, and process payments. Integrates with Hedera network for secure transactions and identity management.",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: process.env.AGENT_URL || "http://localhost:3001/",
  skills: [
    {
      id: "pizza-customization",
      name: "Pizza Customization",
      description:
        "Create custom pizzas with various sizes, crusts, sauces, cheeses, and toppings",
      tags: ["pizza", "customization", "menu", "personalization"],
    },
    {
      id: "loyalty-program",
      name: "Loyalty Program",
      description: "Manage customer loyalty points, rewards, and tier benefits",
      tags: ["loyalty", "rewards", "points", "customer-retention"],
    },
    {
      id: "promo-management",
      name: "Promo Management",
      description: "Handle promotional codes, discounts, and special offers",
      tags: ["promotions", "discounts", "offers", "marketing"],
    },
    {
      id: "order-tracking",
      name: "Order Tracking",
      description:
        "Track pizza orders from preparation to delivery with real-time updates",
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
        "Provide customer support and assistance with pizza orders and delivery",
      tags: ["support", "chat", "assistance", "help"],
    },
    {
      id: "handshake",
      name: "Agent Handshake",
      description:
        "Initiate and complete secure handshakes with other agents for authenticated communication",
      tags: ["handshake", "authentication", "security", "agent-communication"],
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
