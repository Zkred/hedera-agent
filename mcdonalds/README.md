# 🍟 McDonald's Delivery Agent

A specialized A2A (Agent-to-Agent) compatible fast food delivery agent built with LangChain and Hedera blockchain integration. This agent can manage combo meals, handle drive-thru reservations, provide nutritional information, and process McDelivery rewards while maintaining secure transactions through the Hedera network.

## 🚀 Features

### Core Fast Food Capabilities

- **Combo Meal Management**: Create and customize McDonald's combo meals with nutritional info
- **Drive-Thru Management**: Reserve drive-thru slots, manage wait times, and handle pickup scheduling
- **Nutritional Information**: Provide detailed nutritional data for all menu items
- **McDelivery Rewards**: Manage customer rewards program and points system
- **Order Tracking**: Track fast food orders from preparation to delivery with real-time updates
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
- **Tools**: Custom combo meal, drive-thru, and rewards tools

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hedera-agent/mcdonalds
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
   PORT=3002
   AGENT_URL=http://localhost:3002
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

The server will start on port 3002.

### Available Endpoints

#### Health Check

```bash
GET http://localhost:3002/health
```

#### A2A Agent Card

```bash
GET http://localhost:3002/.well-known/agent-card.json
```

#### Message Endpoints

```bash
# REST API
POST http://localhost:3002/message
Content-Type: application/json
{
  "message": "I want to create a combo meal"
}

# A2A Protocol
POST http://localhost:3002/a2a/sendMessage
Content-Type: application/json
{
  "message": {
    "parts": [
      {
        "kind": "text",
        "text": "I want to create a combo meal"
      }
    ]
  }
}
```

## 🧪 Testing

### Test the McDonald's Agent

```bash
npm run test:mcdonalds
```

This will run a comprehensive test of the agent's capabilities including:

- Combo meal creation
- Drive-thru slot management
- Nutritional information lookup
- McDelivery rewards management

## 🍟 Example Usage

### Combo Meal Creation

```
User: "I want a Big Mac combo with medium fries and drink"
Agent: [Creates combo meal with pricing, calories, and nutritional info]
```

### Drive-Thru Reservation

```
User: "Reserve a drive-thru slot for customer_123, arriving in 15 minutes"
Agent: [Finds available slot, reserves it, provides pickup instructions]
```

### Nutritional Information

```
User: "What are the calories and allergens in a Quarter Pounder?"
Agent: [Provides detailed nutritional breakdown and allergen information]
```

### McDelivery Rewards

```
User: "Check my McDelivery points and show available rewards"
Agent: [Shows current points, tier, and redeemable rewards]
```

## 🔧 Agent Capabilities

The McDonald's agent includes the following tools:

### Combo Meal Tools

- `get_combo_meals`: Browse available combo meals with filters
- `create_custom_combo`: Build custom combo meals
- `get_nutritional_info`: Get detailed nutritional information
- `get_available_items`: List all menu items with basic info

### Drive-Thru Tools

- `get_available_drive_thru_slots`: Find available drive-thru slots
- `reserve_drive_thru_slot`: Reserve a specific drive-thru slot
- `release_drive_thru_slot`: Release a reserved slot
- `update_drive_thru_wait_time`: Update wait time estimates
- `get_drive_thru_status`: Get overall drive-thru status

### McDelivery Rewards Tools

- `get_mc_delivery_points`: Check customer points and tier
- `earn_mc_delivery_points`: Add points to customer account
- `redeem_mc_delivery_reward`: Redeem points for rewards
- `get_available_rewards`: List available rewards
- `create_mc_delivery_reward`: Create new rewards

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

- **Combo Meals**: 1.0-1.4 HBAR base price
- **Individual Items**: 0.3-1.0 HBAR
- **Size Upgrades**: 0.1-0.3 HBAR
- **Drive-Thru**: No additional fees
- **Delivery**: 0.05-0.1 HBAR

## 🍔 Nutritional Information

The agent provides comprehensive nutritional data:

- **Calories**: Detailed calorie counts for all items
- **Macronutrients**: Protein, carbs, fat breakdown
- **Micronutrients**: Sodium, sugar content
- **Allergens**: Complete allergen information
- **Dietary Filters**: Vegetarian, vegan, gluten-free options

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
- Run the test suite: `npm run test:mcdonalds`

## 🔮 Future Enhancements

- Real-time drive-thru tracking
- Advanced nutritional analytics
- Dynamic menu recommendations
- Integration with delivery services
- Mobile app support
- Voice ordering capabilities
- AI-powered meal suggestions
