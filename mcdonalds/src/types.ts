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

// Food Delivery Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  zipCode?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  location: Location;
  isOpen: boolean;
  imageUrl?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  allergens?: string[];
  calories?: number;
}

export interface Menu {
  restaurantId: string;
  restaurantName: string;
  items: MenuItem[];
  categories: string[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryTime: string;
  deliveryAddress: Location;
  paymentMethod: string;
  specialInstructions?: string;
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY_FOR_PICKUP = "ready_for_pickup",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface DeliveryUpdate {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  message: string;
  estimatedTime?: string;
}

// API Request/Response Types for Food Delivery
export interface RestaurantSearchRequest {
  location: Location;
  cuisine?: string;
  maxDeliveryTime?: number;
  minRating?: number;
  maxDeliveryFee?: number;
}

export interface RestaurantSearchResponse {
  restaurants: Restaurant[];
  totalCount: number;
}

export interface MenuRequest {
  restaurantId: string;
}

export interface MenuResponse {
  menu: Menu;
}

export interface OrderRequest {
  restaurantId: string;
  items: OrderItem[];
  deliveryAddress: Location;
  paymentMethod: string;
  specialInstructions?: string;
}

export interface OrderResponse {
  order: Order;
  success: boolean;
  message: string;
}

export interface OrderStatusRequest {
  orderId: string;
}

export interface OrderStatusResponse {
  order: Order;
  updates: DeliveryUpdate[];
}

// McDonald's specific types
export interface ComboMeal {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  items: string[];
  size: string;
  calories: number;
  isAvailable: boolean;
}

export interface DriveThruSlot {
  id: string;
  slotNumber: string;
  isAvailable: boolean;
  estimatedWaitTime: number;
  location: Location;
}

export interface McDeliveryReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
}

export interface McDeliveryPoints {
  customerId: string;
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: string;
  nextReward: McDeliveryReward | null;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  sugar: number;
  allergens: string[];
}
