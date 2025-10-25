# 🍽️ Multi-Agent Food Delivery Ecosystem

A comprehensive A2A (Agent-to-Agent) compatible food delivery ecosystem built with LangChain and Hedera blockchain integration. This project features three specialized agents that can work together to provide complete food delivery services while maintaining secure transactions through the Hedera network.

## 🚀 Agents Overview

### 🍕 Zomato Agent (Port 3000)

**General Food Delivery Agent**

- Restaurant discovery and search
- Menu browsing and item details
- Order placement and tracking
- Multi-cuisine support
- Location-based recommendations

### 🍕 Pizza Hut Agent (Port 3001)

**Pizza Customization & Loyalty Agent**

- Custom pizza creation with unlimited combinations
- Loyalty program with tier-based benefits
- Promotional code management
- Pizza size, crust, sauce, and topping options
- Advanced pricing with HBAR

### 🍟 McDonald's Agent (Port 3002)

**Fast Food & Drive-Thru Agent**

- Combo meal creation and management
- Drive-thru slot reservations
- Detailed nutritional information
- McDelivery rewards program
- Real-time wait time management

## 🛠️ Tech Stack

- **Language**: TypeScript/JavaScript
- **Framework**: Express.js
- **AI/LLM**: LangChain with OpenAI GPT-4
- **Blockchain**: Hedera Hashgraph SDK
- **Protocol**: A2A (Agent-to-Agent) Protocol v0.3.0
- **Pricing**: HBAR (Hedera cryptocurrency)

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Hedera account with testnet access
- OpenAI API key

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hedera-agent
   ```

2. **Install dependencies for all agents**

   ```bash
   # Zomato Agent
   cd zomato && npm install

   # Pizza Hut Agent
   cd ../pizzahut && npm install

   # McDonald's Agent
   cd ../mcdonalds && npm install
   ```

3. **Set up environment variables**
   Create `.env` files in each agent directory:
   ```env
   HEDERA_ACCOUNT_ID=your_hedera_account_id
   HEDERA_PRIVATE_KEY=your_hedera_private_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000  # or 3001, 3002
   AGENT_URL=http://localhost:3000  # or 3001, 3002
   ```

## 🚀 Usage

### Start All Agents

```bash
# Terminal 1 - Zomato Agent
cd zomato && npm run dev

# Terminal 2 - Pizza Hut Agent
cd pizzahut && npm run dev

# Terminal 3 - McDonald's Agent
cd mcdonalds && npm run dev
```

## 🌐 A2A Protocol Endpoints

Each agent provides the following A2A-compliant endpoints:

### Health Check

```bash
GET http://localhost:3000/health  # Zomato
GET http://localhost:3001/health  # Pizza Hut
GET http://localhost:3002/health  # McDonald's
```

### Agent Cards

```bash
GET http://localhost:3000/.well-known/agent-card.json
GET http://localhost:3001/.well-known/agent-card.json
GET http://localhost:3002/.well-known/agent-card.json
```

### Message Endpoints

```bash
# REST API
POST http://localhost:3000/message
POST http://localhost:3001/message
POST http://localhost:3002/message

# A2A Protocol
POST http://localhost:3000/a2a/sendMessage
POST http://localhost:3001/a2a/sendMessage
POST http://localhost:3002/a2a/sendMessage

# A2A Streaming
POST http://localhost:3000/a2a/sendMessageStream
POST http://localhost:3001/a2a/sendMessageStream
POST http://localhost:3002/a2a/sendMessageStream
```

## 💰 HBAR Pricing System

All agents use HBAR (Hedera cryptocurrency) for pricing:

### Zomato Agent

- **Restaurant Items**: 0.6-1.2 HBAR
- **Delivery Fees**: 0.06-0.12 HBAR
- **Minimum Orders**: 0.6-1.2 HBAR

### Pizza Hut Agent

- **Base Pizza**: 1 HBAR (small) to 2 HBAR (extra large)
- **Toppings**: 0.15-0.25 HBAR each
- **Crust Upgrades**: 0-0.3 HBAR
- **Loyalty Multipliers**: 1.0x to 1.5x

### McDonald's Agent

- **Combo Meals**: 1.0-1.4 HBAR
- **Individual Items**: 0.3-1.0 HBAR
- **Drive-Thru**: No additional fees
- **McDelivery Rewards**: Points-based system

## 🔧 Agent Capabilities

### Zomato Agent Tools

- `search_restaurants` - Find restaurants by location and filters
- `get_restaurant_details` - Get detailed restaurant information
- `get_restaurant_menu` - Browse restaurant menus
- `get_menu_item_details` - Get item information
- `place_order` - Place food orders
- `get_order_status` - Track order status

### Pizza Hut Agent Tools

- `create_custom_pizza` - Build custom pizzas
- `get_pizza_sizes` - Get pizza size options
- `get_pizza_toppings` - Browse toppings
- `get_loyalty_points` - Check loyalty status
- `earn_loyalty_points` - Add loyalty points
- `validate_promo_code` - Apply promotional codes

### McDonald's Agent Tools

- `get_combo_meals` - Browse combo meals
- `create_custom_combo` - Build custom combos
- `get_nutritional_info` - Get nutritional data
- `get_available_drive_thru_slots` - Find drive-thru slots
- `reserve_drive_thru_slot` - Reserve pickup slots
- `get_mc_delivery_points` - Check rewards points
