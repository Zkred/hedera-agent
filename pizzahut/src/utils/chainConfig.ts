import * as fs from "fs";
import * as path from "path";

export interface ChainConfig {
  agentId: string;
  chainId: number;
  description: string;
  serviceEndpoint: string;
  publicKey: string;
  registeredAt: string;
  did: string;
}

export class ChainConfigManager {
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), "chain.json");
  }

  async loadConfig(): Promise<ChainConfig | null> {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, "utf8");
        return JSON.parse(configData);
      }
      return null;
    } catch (error) {
      console.error("Error loading chain config:", error);
      return null;
    }
  }

  async saveConfig(config: ChainConfig): Promise<void> {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error("Error saving chain config:", error);
      throw error;
    }
  }

  async initializeChainConfig(): Promise<ChainConfig> {
    const config: ChainConfig = {
      agentId: "",
      chainId: 296, // Hedera Testnet
      description: "Pizza Hut Delivery Agent",
      serviceEndpoint: process.env.AGENT_URL || "http://localhost:3001/",
      publicKey: "",
      registeredAt: new Date().toISOString(),
      did: "",
    };

    await this.saveConfig(config);
    return config;
  }

  async updateAgentId(agentId: string): Promise<void> {
    const config = await this.loadConfig();
    if (config) {
      config.agentId = agentId;
      await this.saveConfig(config);
    }
  }

  async updateDid(did: string): Promise<void> {
    const config = await this.loadConfig();
    if (config) {
      config.did = did;
      await this.saveConfig(config);
    }
  }

  async updatePublicKey(publicKey: string): Promise<void> {
    const config = await this.loadConfig();
    if (config) {
      config.publicKey = publicKey;
      await this.saveConfig(config);
    }
  }
}
