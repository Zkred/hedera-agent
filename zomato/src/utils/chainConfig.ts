import fs from "fs";
import path from "path";

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
  private config: ChainConfig | null = null;

  constructor() {
    this.configPath = path.join(process.cwd(), "chain.json");
  }

  async loadConfig(): Promise<ChainConfig | null> {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8");
        this.config = JSON.parse(data);
        return this.config;
      }
      return null;
    } catch (error) {
      console.error("Error loading chain config:", error);
      return null;
    }
  }

  async saveConfig(config: ChainConfig): Promise<void> {
    try {
      this.config = config;
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      console.log("Chain configuration saved successfully");
    } catch (error) {
      console.error("Error saving chain config:", error);
      throw error;
    }
  }

  getConfig(): ChainConfig | null {
    return this.config;
  }

  hasConfig(): boolean {
    return this.config !== null;
  }

  async initializeChainConfig(): Promise<ChainConfig> {
    const port = process.env.PORT || 3000;
    const randomString = Math.random().toString(36).substring(7);

    const config: ChainConfig = {
      agentId: "", // Will be set after registration
      chainId: 296, // Hedera Testnet
      description: "Wiki agent",
      serviceEndpoint: `https://localhost:${port}/${randomString}`,
      publicKey: "", // Will be set after registration
      registeredAt: new Date().toISOString(),
      did: "", // Will be set after registration
    };

    await this.saveConfig(config);
    return config;
  }

  async updateAgentId(agentId: string): Promise<void> {
    if (this.config) {
      this.config.agentId = agentId;
      await this.saveConfig(this.config);
    }
  }

  async updateDid(did: string): Promise<void> {
    if (this.config) {
      this.config.did = did;
      await this.saveConfig(this.config);
    }
  }

  async updatePublicKey(publicKey: string): Promise<void> {
    if (this.config) {
      this.config.publicKey = publicKey;
      await this.saveConfig(this.config);
    }
  }
}
