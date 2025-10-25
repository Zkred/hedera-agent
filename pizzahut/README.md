# 🍕 Pizza Hut Delivery Agent

A specialized A2A (Agent-to-Agent) compatible pizza delivery agent built with LangChain and Hedera blockchain integration. This agent can create custom pizzas, manage loyalty programs, handle promotional codes, and process orders while maintaining secure transactions through the Hedera network.

## 🚀 Features

### Core Pizza Delivery Capabilities

- **Custom Pizza Creation**: Build pizzas with various sizes, crusts, sauces, cheeses, and toppings
- **Loyalty Program Management**: Track customer loyalty points, tiers, and rewards
- **Promotional Code System**: Handle discount codes and special offers
- **Order Tracking**: Track pizza orders from preparation to delivery with real-time updates
- **Secure Payments**: Handle payments through Hedera blockchain for secure transactions

### A2A Protocol Support

- **Agent Card**: Compliant with A2A protocol for agent discovery
- **Message Handling**: Support for both REST API and A2A protocol endpoints
- **Streaming**: Real-time updates via Server-Sent Events (SSE)
- **Task Management**: Full task lifecycle management (submitted → working → completed)

### Blockchain Integration

- **Hedera Network**: Secure blockchain operations for payments and identity verification
- **DID Management**: Decentralized identity management using Zkred Agent ID plugin
- **Smart Contracts**: Integration with Hedera smart contracts for secure transactions

## 🛠️ Tech Stack

- **Language**: TypeScript/JavaScript
- **Framework**: Express.js
- **AI/LLM**: LangChain with OpenAI GPT-4
- **Blockchain**: Hedera Hashgraph SDK
- **Protocol**: A2A (Agent-to-Agent) Protocol v0.3.0
- **Tools**: Custom pizza customization, loyalty, and promotional tools

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hedera-agent/pizzahut
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with the following variables:

   ```env
   HEDERA_ACCOUNT_ID=your_hedera_account_id
   HEDERA_PRIVATE_KEY=your_hedera_private_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=3001
   AGENT_URL=http://localhost:3001
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Usage

### Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on port 3001.

### Available Endpoints

#### Health Check

```bash
GET http://localhost:3001/health
```

#### A2A Agent Card

```bash
GET http://localhost:3001/.well-known/agent-card.json
```

#### Message Endpoints

```bash
# REST API
POST http://localhost:3001/message
Content-Type: application/json
{
  "message": "I want to create a custom pizza"
}

# A2A Protocol
POST http://localhost:3001/a2a/sendMessage
Content-Type: application/json
{
  "message": {
    "parts": [
      {
        "kind": "text",
        "text": "I want to create a custom pizza"
      }
    ]
  }
}
```

## 🧪 Testing

### Test the Pizza Hut Agent

```bash
npm run test:pizzahut
```

This will run a comprehensive test of the agent's capabilities including:

- Custom pizza creation
- Loyalty program management
- Promotional code handling
- Pizza information queries

## 🍕 Example Usage

### Custom Pizza Creation

```
User: "I want a large pizza with thin crust, BBQ sauce, mozzarella, pepperoni, and mushrooms"
Agent: [Creates custom pizza with pricing, nutritional info, and preparation time]
```

### Loyalty Program

```
User: "Check my loyalty points for customer_123"
Agent: [Shows current points, tier, and available rewards]
```

### Promotional Codes

```
User: "Apply promo code PIZZA20 to my 2.5 HBAR order"
Agent: [Validates code, calculates discount, shows final price]
```

## 🔧 Agent Capabilities

The Pizza Hut agent includes the following tools:

### Pizza Customization Tools

- `create_custom_pizza`: Build custom pizzas with all options
- `get_pizza_sizes`: Get available pizza sizes and pricing
- `get_pizza_toppings`: Browse toppings by category or dietary preferences
- `get_crust_types`: Get available crust types and pricing

### Loyalty Program Tools

- `get_loyalty_points`: Check customer loyalty status and points
- `earn_loyalty_points`: Add points with tier-based multipliers
- `redeem_loyalty_points`: Redeem points for rewards
- `get_loyalty_tiers`: View all loyalty tiers and benefits

### Promotional Tools

- `validate_promo_code`: Validate and apply promotional codes
- `create_promo_code`: Create new promotional codes
- `get_active_promo_codes`: List all active promotional codes
- `deactivate_promo_code`: Deactivate promotional codes

### Blockchain Tools

- Hedera network operations
- DID generation and management
- Secure payment processing
- Identity verification

## 🌐 A2A Protocol Compliance

This agent is fully compliant with the A2A (Agent-to-Agent) Protocol v0.3.0:

- **Agent Card**: Provides comprehensive agent information and capabilities
- **Message Handling**: Supports both synchronous and streaming message processing
- **Task Management**: Full task lifecycle with status updates
- **Error Handling**: Proper error codes and messages
- **Authentication**: Secure agent-to-agent communication

## 🔒 Security Features

- **Hedera Blockchain**: All transactions are secured through Hedera network
- **DID Management**: Decentralized identity for secure agent communication
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Secure error handling without information leakage
- **Authentication**: API key and token-based authentication

## 💰 HBAR Pricing System

All pricing is in HBAR (Hedera cryptocurrency):

- **Base Pizza**: 1 HBAR (small), 1.3 HBAR (medium), 1.6 HBAR (large), 2 HBAR (extra large)
- **Toppings**: 0.15-0.25 HBAR per topping
- **Crust Upgrades**: 0-0.3 HBAR
- **Sauce Upgrades**: 0-0.1 HBAR
- **Cheese Upgrades**: 0-0.2 HBAR

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check the health endpoint: `GET /health`
- Review the agent card: `GET /.well-known/agent-card.json`
- Run the test suite: `npm run test:pizzahut`

## 🔮 Future Enhancements

- Real-time pizza tracking
- Advanced loyalty analytics
- Dynamic pricing based on demand
- Integration with delivery services
- Mobile app support
- Voice ordering capabilities
