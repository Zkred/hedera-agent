import { HederaAgentService } from "./hederaAgent";

export interface CreateIdentityParams {
  privateKey: string;
  chainId: number;
  description: string;
  serviceEndpoint: string;
}

export class IdentityService {
  private agentService: HederaAgentService;

  constructor(agentService: HederaAgentService) {
    this.agentService = agentService;
  }

  async createIdentity(params: CreateIdentityParams): Promise<any> {
    try {
      // Get the agent instance from the service
      const agent = (this.agentService as any).agent;

      if (!agent) {
        throw new Error("Agent not initialized");
      }

      // Use the proper LangChain agent invocation method
      const {
        SystemMessage,
        HumanMessage,
      } = require("@langchain/core/messages");

      const result = await agent.invoke({
        messages: [
          new SystemMessage(
            "You are a helpful assistant that can interact with the Hedera network. Use the create_identity tool to register this agent on the chain."
          ),
          new HumanMessage(
            `Please use the create_identity tool with these parameters:
            - privateKey: ${params.privateKey}
            - chainId: ${params.chainId}
            - description: ${params.description}
            - serviceEndpoint: ${params.serviceEndpoint}`
          ),
        ],
      });

      const response = result.messages[result.messages.length - 1].content;
      console.log("Create identity response:", response);

      // Try to parse the response for agent ID and DID
      let agentId = null;
      let did = null;

      if (response && typeof response === "string") {
        try {
          // Try to extract JSON from the response
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            if (result.success && result.agentId) {
              agentId = result.agentId.toString();
            }
            if (result.success && result.did) {
              did = result.did;
            }
          } else {
            // Fallback to regex parsing
            const agentIdMatch = response.match(/(\d+n?)/);
            if (agentIdMatch) {
              agentId = agentIdMatch[1].replace("n", ""); // Remove 'n' from BigInt
            }

            const didMatch = response.match(
              /did:iden3:privado:main:[a-zA-Z0-9]+/i
            );
            if (didMatch) {
              did = didMatch[0];
            }
          }
        } catch (parseError) {
          console.log("Could not parse JSON response, using regex fallback");
          // Fallback to regex parsing
          const agentIdMatch = response.match(/(\d+n?)/);
          if (agentIdMatch) {
            agentId = agentIdMatch[1].replace("n", ""); // Remove 'n' from BigInt
          }

          const didMatch = response.match(
            /did:iden3:privado:main:[a-zA-Z0-9]+/i
          );
          if (didMatch) {
            did = didMatch[0];
          }
        }
      }

      // Update chain configuration with the returned agent ID and DID
      if (agentId) {
        const chainConfigManager = (this.agentService as any)
          .chainConfigManager;
        await chainConfigManager.updateAgentId(agentId);
        console.log("Agent ID updated:", agentId);
      }

      if (did) {
        const chainConfigManager = (this.agentService as any)
          .chainConfigManager;
        await chainConfigManager.updateDid(did);
        console.log("DID updated:", did);
      }

      return {
        response,
        agentId,
        did,
      };
    } catch (error) {
      console.error("Error creating identity:", error);
      throw error;
    }
  }

  async getIdentity(): Promise<any> {
    try {
      const chainConfig = this.agentService.getChainConfig();
      if (!chainConfig) {
        throw new Error("No chain configuration found");
      }

      return {
        agentId: chainConfig.agentId,
        chainId: chainConfig.chainId,
        description: chainConfig.description,
        serviceEndpoint: chainConfig.serviceEndpoint,
        publicKey: chainConfig.publicKey,
        registeredAt: chainConfig.registeredAt,
        did: chainConfig.did,
      };
    } catch (error) {
      console.error("Error getting identity:", error);
      throw error;
    }
  }
}
