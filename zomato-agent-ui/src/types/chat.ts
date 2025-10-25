export interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  type?: "text" | "restaurant" | "order" | "payment";
  data?: any;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  deliveryTime: string;
  image: string;
  address: string;
}

export interface Order {
  id: string;
  restaurant: Restaurant;
  items: OrderItem[];
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "out_for_delivery"
    | "delivered";
  estimatedTime: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentOrder?: Order;
  userLocation?: string;
}
