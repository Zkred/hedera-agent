// API Request/Response Types
export interface MessageRequest {
  message: string;
}

export interface MessageResponse {
  response: string;
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

// Agent Types
export interface AgentResponse {
  content: string;
  messages: any[];
}

// Environment Variables Type
export interface EnvConfig {
  HEDERA_ACCOUNT_ID: string;
  HEDERA_PRIVATE_KEY: string;
  OPENAI_API_KEY: string;
  PORT?: string;
}
