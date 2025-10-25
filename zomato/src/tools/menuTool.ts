import { tool } from "langchain";
import { z } from "zod";
import { Menu, MenuItem, MenuRequest, MenuResponse } from "../types";

// Mock menu data for demonstration
const mockMenus: { [restaurantId: string]: Menu } = {
  rest_001: {
    restaurantId: "rest_001",
    restaurantName: "Pizza Palace",
    categories: ["Pizza", "Appetizers", "Beverages", "Desserts"],
    items: [
      {
        id: "item_001",
        name: "Margherita Pizza",
        description:
          "Classic pizza with tomato sauce, mozzarella, and fresh basil",
        price: 1.0, // 1 HBAR
        category: "Pizza",
        isAvailable: true,
        imageUrl: "https://example.com/margherita.jpg",
        allergens: ["gluten", "dairy"],
        calories: 320,
      },
      {
        id: "item_002",
        name: "Pepperoni Pizza",
        description: "Traditional pizza topped with pepperoni and mozzarella",
        price: 1.2, // 1.2 HBAR
        category: "Pizza",
        isAvailable: true,
        imageUrl: "https://example.com/pepperoni.jpg",
        allergens: ["gluten", "dairy", "pork"],
        calories: 380,
      },
      {
        id: "item_003",
        name: "Garlic Bread",
        description: "Fresh bread with garlic butter and herbs",
        price: 6.99,
        category: "Appetizers",
        isAvailable: true,
        imageUrl: "https://example.com/garlic-bread.jpg",
        allergens: ["gluten", "dairy"],
        calories: 180,
      },
      {
        id: "item_004",
        name: "Coca Cola",
        description: "Classic Coca Cola 12oz can",
        price: 2.99,
        category: "Beverages",
        isAvailable: true,
        imageUrl: "https://example.com/coca-cola.jpg",
        calories: 140,
      },
      {
        id: "item_005",
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 8.99,
        category: "Desserts",
        isAvailable: false,
        imageUrl: "https://example.com/tiramisu.jpg",
        allergens: ["dairy", "eggs", "gluten"],
        calories: 420,
      },
    ],
  },
  rest_002: {
    restaurantId: "rest_002",
    restaurantName: "Burger Barn",
    categories: ["Burgers", "Sides", "Beverages", "Desserts"],
    items: [
      {
        id: "item_006",
        name: "Classic Cheeseburger",
        description: "Beef patty with cheese, lettuce, tomato, and onion",
        price: 12.99,
        category: "Burgers",
        isAvailable: true,
        imageUrl: "https://example.com/cheeseburger.jpg",
        allergens: ["gluten", "dairy"],
        calories: 520,
      },
      {
        id: "item_007",
        name: "Bacon Deluxe Burger",
        description: "Double beef patty with bacon, cheese, and special sauce",
        price: 15.99,
        category: "Burgers",
        isAvailable: true,
        imageUrl: "https://example.com/bacon-burger.jpg",
        allergens: ["gluten", "dairy", "pork"],
        calories: 680,
      },
      {
        id: "item_008",
        name: "French Fries",
        description: "Crispy golden french fries with sea salt",
        price: 4.99,
        category: "Sides",
        isAvailable: true,
        imageUrl: "https://example.com/fries.jpg",
        calories: 320,
      },
      {
        id: "item_009",
        name: "Onion Rings",
        description: "Beer-battered onion rings",
        price: 5.99,
        category: "Sides",
        isAvailable: true,
        imageUrl: "https://example.com/onion-rings.jpg",
        allergens: ["gluten"],
        calories: 280,
      },
      {
        id: "item_010",
        name: "Chocolate Milkshake",
        description: "Rich chocolate milkshake with whipped cream",
        price: 6.99,
        category: "Beverages",
        isAvailable: true,
        imageUrl: "https://example.com/milkshake.jpg",
        allergens: ["dairy"],
        calories: 450,
      },
    ],
  },
  rest_003: {
    restaurantId: "rest_003",
    restaurantName: "Sushi Express",
    categories: ["Sushi", "Sashimi", "Rolls", "Beverages"],
    items: [
      {
        id: "item_011",
        name: "California Roll",
        description: "Crab, avocado, and cucumber roll",
        price: 8.99,
        category: "Rolls",
        isAvailable: true,
        imageUrl: "https://example.com/california-roll.jpg",
        allergens: ["fish", "soy"],
        calories: 250,
      },
      {
        id: "item_012",
        name: "Salmon Sashimi",
        description: "Fresh salmon sashimi (6 pieces)",
        price: 12.99,
        category: "Sashimi",
        isAvailable: true,
        imageUrl: "https://example.com/salmon-sashimi.jpg",
        allergens: ["fish"],
        calories: 180,
      },
      {
        id: "item_013",
        name: "Dragon Roll",
        description: "Eel, cucumber, and avocado topped with eel sauce",
        price: 14.99,
        category: "Rolls",
        isAvailable: true,
        imageUrl: "https://example.com/dragon-roll.jpg",
        allergens: ["fish", "soy"],
        calories: 320,
      },
      {
        id: "item_014",
        name: "Miso Soup",
        description: "Traditional Japanese miso soup with tofu and seaweed",
        price: 3.99,
        category: "Sides",
        isAvailable: true,
        imageUrl: "https://example.com/miso-soup.jpg",
        allergens: ["soy"],
        calories: 80,
      },
      {
        id: "item_015",
        name: "Green Tea",
        description: "Traditional Japanese green tea",
        price: 2.99,
        category: "Beverages",
        isAvailable: true,
        imageUrl: "https://example.com/green-tea.jpg",
        calories: 5,
      },
    ],
  },
};

export const getMenuTool = tool(
  async (args: MenuRequest): Promise<string> => {
    try {
      const menu = mockMenus[args.restaurantId];

      if (!menu) {
        return JSON.stringify({
          error: "Menu not found for restaurant",
          restaurantId: args.restaurantId,
        });
      }

      const response: MenuResponse = {
        menu: menu,
      };

      return JSON.stringify(response);
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get restaurant menu",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_restaurant_menu",
    description:
      "Get the complete menu for a specific restaurant including all items, categories, prices, and availability",
    schema: z.object({
      restaurantId: z
        .string()
        .describe("The unique identifier of the restaurant"),
    }),
  }
);

export const getMenuItemDetailsTool = tool(
  async (args: {
    restaurantId: string;
    menuItemId: string;
  }): Promise<string> => {
    try {
      const menu = mockMenus[args.restaurantId];

      if (!menu) {
        return JSON.stringify({
          error: "Menu not found for restaurant",
          restaurantId: args.restaurantId,
        });
      }

      const menuItem = menu.items.find((item) => item.id === args.menuItemId);

      if (!menuItem) {
        return JSON.stringify({
          error: "Menu item not found",
          restaurantId: args.restaurantId,
          menuItemId: args.menuItemId,
        });
      }

      return JSON.stringify(menuItem);
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get menu item details",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_menu_item_details",
    description: "Get detailed information about a specific menu item",
    schema: z.object({
      restaurantId: z
        .string()
        .describe("The unique identifier of the restaurant"),
      menuItemId: z.string().describe("The unique identifier of the menu item"),
    }),
  }
);
