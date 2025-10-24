// index.js
const dotenv = require('dotenv');
dotenv.config();

const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { createAgent } = require('langchain');
const { Client, PrivateKey } = require('@hashgraph/sdk');
const { HederaLangchainToolkit, coreQueriesPlugin } = require('hedera-agent-kit');
const { ChatOpenAI } = require('@langchain/openai');
const { zkredAgentIdPlugin } = require("@zkred/hedera-agentid-plugin");

// Choose your AI provider (install the one you want to use)
function createLLM() {
  return new ChatOpenAI({ model: 'gpt-4o-mini' });  
}

async function main() {
  // Initialize AI model
  const llm = createLLM();


  // Hedera client setup (Testnet by default)
  const client = Client.forTestnet().setOperator(
    process.env.HEDERA_ACCOUNT_ID,
    PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY),
  );

  const hederaAgentToolkit = new HederaLangchainToolkit({
    client,
    configuration: {
      plugins: [coreQueriesPlugin, zkredAgentIdPlugin] // all our core plugins here https://github.com/hedera-dev/hedera-agent-kit/tree/main/typescript/src/plugins
    },
  });
  
  // Fetch tools from toolkit
  const tools = hederaAgentToolkit.getTools();

  // Create the agent using the new LangChain v1.0.1 API
  const agent = createAgent({
    model: llm,
    tools,
    systemPrompt: 'You are a helpful assistant that can interact with the Hedera network.',
  });
  
  // Invoke the agent directly
  const response = await agent.invoke({ 
    messages: [{ role: 'user', content: "generate an agent DID for my account: 0xfd885bf080abffe1dcde1f88782fc4007b5207e5 for Privado Main" }] 
  });
  console.log(response);
}

main().catch(console.error);