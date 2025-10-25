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
    name: "Zkred Wiki Agent",
    description:
      "A specialized agent that can interact with the Hedera network, generate DIDs, perform blockchain operations using the Hedera Agent Kit, and conduct research using Wikipedia.",
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
        id: "hedera-operations",
        name: "Hedera Operations",
        description:
          "Perform operations on the Hedera network including account queries, token operations, and smart contract interactions",
        tags: ["blockchain", "hedera", "cryptocurrency", "defi"],
      },
      {
        id: "did-generation",
        name: "DID Generation",
        description:
          "Generate decentralized identifiers using Zkred Agent ID plugin for identity management",
        tags: ["did", "identity", "ssi", "privacy"],
      },
      {
        id: "research",
        name: "Wiki Tool",
        description:
          "Conduct research using Wikipedia and provide information on various topics",
        tags: ["research", "wikipedia", "information", "knowledge"],
      },
      {
        id: "chat",
        name: "Chat",
        description:
          "General conversation and assistance with Hedera-related questions",
        tags: ["chat", "assistant", "support"],
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
  name: "Zkred Wiki Agent",
  description:
    "A specialized agent that can interact with the Hedera network, generate DIDs, perform blockchain operations using the Hedera Agent Kit, and conduct research using Wikipedia.",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: process.env.AGENT_URL || "http://localhost:3000/",
  skills: [
    {
      id: "hedera-operations",
      name: "Hedera Operations",
      description:
        "Perform operations on the Hedera network including account queries, token operations, and smart contract interactions",
      tags: ["blockchain", "hedera", "cryptocurrency", "defi"],
    },
    {
      id: "did-generation",
      name: "DID Generation",
      description:
        "Generate decentralized identifiers using Zkred Agent ID plugin for identity management",
      tags: ["did", "identity", "ssi", "privacy"],
    },
    {
      id: "research",
      name: "Wiki Tool",
      description:
        "Conduct research using Wikipedia and provide information on various topics",
      tags: ["research", "wikipedia", "information", "knowledge"],
    },
    {
      id: "chat",
      name: "Chat",
      description:
        "General conversation and assistance with Hedera-related questions",
      tags: ["chat", "assistant", "support"],
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
