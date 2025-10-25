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
export const createHederaAgentCard = async (): Promise<ExtendedAgentCard> => {
  const chainConfigManager = new ChainConfigManager();
  const chainConfig = await chainConfigManager.loadConfig();

  return {
    name: "Zomato Food Delivery Agent",
    description:
      "A specialized food delivery agent that can discover restaurants, browse menus, place orders, and track deliveries. Integrates with Hedera network for secure transactions and identity management.",
    protocolVersion: "0.3.0",
    version: "1.0.0",
    url: process.env.AGENT_URL || "http://localhost:3000/",
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
        id: "restaurant-discovery",
        name: "Restaurant Discovery",
        description:
          "Find restaurants near a location, filter by cuisine, ratings, and availability",
        tags: ["food", "restaurants", "location", "discovery"],
      },
      {
        id: "menu-browsing",
        name: "Menu Browsing",
        description:
          "Browse restaurant menus, check item availability, and get pricing information",
        tags: ["menu", "food", "pricing", "availability"],
      },
      {
        id: "order-placement",
        name: "Order Placement",
        description:
          "Place food orders, handle payment processing, and manage order details",
        tags: ["orders", "payment", "food", "delivery"],
      },
      {
        id: "order-tracking",
        name: "Order Tracking",
        description:
          "Track order status, delivery progress, and provide real-time updates",
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
          "Provide customer support and assistance with food delivery queries",
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
export const hederaAgentCard: AgentCard = {
  name: "Zomato Food Delivery Agent",
  description:
    "A specialized food delivery agent that can discover restaurants, browse menus, place orders, and track deliveries. Integrates with Hedera network for secure transactions and identity management.",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: process.env.AGENT_URL || "http://localhost:3000/",
  skills: [
    {
      id: "restaurant-discovery",
      name: "Restaurant Discovery",
      description:
        "Find restaurants near a location, filter by cuisine, ratings, and availability",
      tags: ["food", "restaurants", "location", "discovery"],
    },
    {
      id: "menu-browsing",
      name: "Menu Browsing",
      description:
        "Browse restaurant menus, check item availability, and get pricing information",
      tags: ["menu", "food", "pricing", "availability"],
    },
    {
      id: "order-placement",
      name: "Order Placement",
      description:
        "Place food orders, handle payment processing, and manage order details",
      tags: ["orders", "payment", "food", "delivery"],
    },
    {
      id: "order-tracking",
      name: "Order Tracking",
      description:
        "Track order status, delivery progress, and provide real-time updates",
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
        "Provide customer support and assistance with food delivery queries",
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
