import { tool } from "langchain";
import { z } from "zod";
import { ComboMeal, NutritionalInfo } from "../types";

// McDonald's combo meals with HBAR pricing (1 HBAR = base unit)
const comboMeals: ComboMeal[] = [
  {
    id: "combo_big_mac",
    name: "Big Mac Combo",
    description: "Big Mac burger with medium fries and medium drink",
    basePrice: 1.2, // 1.2 HBAR
    items: ["big_mac", "medium_fries", "medium_drink"],
    size: "Medium",
    calories: 1080,
    isAvailable: true,
  },
  {
    id: "combo_quarter_pounder",
    name: "Quarter Pounder Combo",
    description: "Quarter Pounder burger with medium fries and medium drink",
    basePrice: 1.3, // 1.3 HBAR
    items: ["quarter_pounder", "medium_fries", "medium_drink"],
    size: "Medium",
    calories: 1120,
    isAvailable: true,
  },
  {
    id: "combo_chicken_nuggets",
    name: "Chicken McNuggets Combo",
    description:
      "10-piece Chicken McNuggets with medium fries and medium drink",
    basePrice: 1.4, // 1.4 HBAR
    items: ["chicken_nuggets_10pc", "medium_fries", "medium_drink"],
    size: "Medium",
    calories: 980,
    isAvailable: true,
  },
  {
    id: "combo_fish_fillet",
    name: "Filet-O-Fish Combo",
    description: "Filet-O-Fish sandwich with medium fries and medium drink",
    basePrice: 1.1, // 1.1 HBAR
    items: ["filet_o_fish", "medium_fries", "medium_drink"],
    size: "Medium",
    calories: 920,
    isAvailable: true,
  },
  {
    id: "combo_mcchicken",
    name: "McChicken Combo",
    description: "McChicken sandwich with medium fries and medium drink",
    basePrice: 1.0, // 1 HBAR
    items: ["mcchicken", "medium_fries", "medium_drink"],
    size: "Medium",
    calories: 850,
    isAvailable: true,
  },
];

// Nutritional information for menu items
const nutritionalInfo: { [itemId: string]: NutritionalInfo } = {
  big_mac: {
    calories: 550,
    protein: 25,
    carbs: 45,
    fat: 33,
    sodium: 1010,
    sugar: 9,
    allergens: ["gluten", "dairy", "soy"],
  },
  quarter_pounder: {
    calories: 520,
    protein: 26,
    carbs: 42,
    fat: 26,
    sodium: 1110,
    sugar: 10,
    allergens: ["gluten", "dairy", "soy"],
  },
  chicken_nuggets_10pc: {
    calories: 470,
    protein: 25,
    carbs: 30,
    fat: 30,
    sodium: 900,
    sugar: 0,
    allergens: ["gluten", "soy"],
  },
  filet_o_fish: {
    calories: 380,
    protein: 15,
    carbs: 39,
    fat: 18,
    sodium: 560,
    sugar: 5,
    allergens: ["fish", "gluten", "dairy"],
  },
  mcchicken: {
    calories: 400,
    protein: 14,
    carbs: 40,
    fat: 22,
    sodium: 830,
    sugar: 6,
    allergens: ["gluten", "soy"],
  },
  medium_fries: {
    calories: 320,
    protein: 4,
    carbs: 43,
    fat: 15,
    sodium: 260,
    sugar: 0,
    allergens: ["gluten"],
  },
  medium_drink: {
    calories: 150,
    protein: 0,
    carbs: 39,
    fat: 0,
    sodium: 15,
    sugar: 39,
    allergens: [],
  },
};

export const getComboMealsTool = tool(
  async (args: { size?: string; maxCalories?: number }): Promise<string> => {
    try {
      let filteredCombos = [...comboMeals];

      // Filter by size
      if (args.size) {
        filteredCombos = filteredCombos.filter(
          (combo) => combo.size.toLowerCase() === args.size!.toLowerCase()
        );
      }

      // Filter by max calories
      if (args.maxCalories) {
        filteredCombos = filteredCombos.filter(
          (combo) => combo.calories <= args.maxCalories!
        );
      }

      // Filter available combos
      filteredCombos = filteredCombos.filter((combo) => combo.isAvailable);

      return JSON.stringify({
        success: true,
        comboMeals: filteredCombos,
        totalCount: filteredCombos.length,
        message: "Available combo meals retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get combo meals",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_combo_meals",
    description:
      "Get available McDonald's combo meals with optional filters for size and calories",
    schema: z.object({
      size: z
        .string()
        .optional()
        .describe("Filter by combo size (Small, Medium, Large)"),
      maxCalories: z.number().optional().describe("Maximum calories filter"),
    }),
  }
);

export const createCustomComboTool = tool(
  async (args: {
    mainItem: string;
    sideItem: string;
    drinkItem: string;
    size: string;
  }): Promise<string> => {
    try {
      const { mainItem, sideItem, drinkItem, size } = args;

      // Validate items exist in nutritional info
      const mainItemInfo = nutritionalInfo[mainItem];
      const sideItemInfo = nutritionalInfo[sideItem];
      const drinkItemInfo = nutritionalInfo[drinkItem];

      if (!mainItemInfo || !sideItemInfo || !drinkItemInfo) {
        return JSON.stringify({
          error: "Invalid menu items selected",
          availableItems: Object.keys(nutritionalInfo),
        });
      }

      // Calculate total nutritional info
      const totalNutrition: NutritionalInfo = {
        calories:
          mainItemInfo.calories +
          sideItemInfo.calories +
          drinkItemInfo.calories,
        protein:
          mainItemInfo.protein + sideItemInfo.protein + drinkItemInfo.protein,
        carbs: mainItemInfo.carbs + sideItemInfo.carbs + drinkItemInfo.carbs,
        fat: mainItemInfo.fat + sideItemInfo.fat + drinkItemInfo.fat,
        sodium:
          mainItemInfo.sodium + sideItemInfo.sodium + drinkItemInfo.sodium,
        sugar: mainItemInfo.sugar + sideItemInfo.sugar + drinkItemInfo.sugar,
        allergens: [
          ...new Set([
            ...mainItemInfo.allergens,
            ...sideItemInfo.allergens,
            ...drinkItemInfo.allergens,
          ]),
        ],
      };

      // Calculate base price (simplified pricing)
      let basePrice = 1.0; // 1 HBAR base
      if (size.toLowerCase() === "large") {
        basePrice = 1.3; // 1.3 HBAR for large
      } else if (size.toLowerCase() === "small") {
        basePrice = 0.8; // 0.8 HBAR for small
      }

      const customCombo = {
        id: `custom_combo_${Date.now()}`,
        name: `Custom ${size} Combo`,
        description: `Custom combo with ${mainItem}, ${sideItem}, and ${drinkItem}`,
        basePrice: basePrice,
        items: [mainItem, sideItem, drinkItem],
        size: size,
        calories: totalNutrition.calories,
        nutritionalInfo: totalNutrition,
        isAvailable: true,
        estimatedPrepTime: "5-8 minutes",
      };

      return JSON.stringify({
        success: true,
        customCombo: customCombo,
        message: `Custom combo created successfully! Price: ${basePrice} HBAR`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to create custom combo",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "create_custom_combo",
    description:
      "Create a custom McDonald's combo meal with selected items and size",
    schema: z.object({
      mainItem: z.string().describe("Main item ID"),
      sideItem: z.string().describe("Side item ID"),
      drinkItem: z.string().describe("Drink item ID"),
      size: z.string().describe("Combo size (Small, Medium, Large)"),
    }),
  }
);

export const getNutritionalInfoTool = tool(
  async (args: { itemId: string }): Promise<string> => {
    try {
      const { itemId } = args;
      const nutrition = nutritionalInfo[itemId];

      if (!nutrition) {
        return JSON.stringify({
          error: "Nutritional information not found",
          itemId: itemId,
          availableItems: Object.keys(nutritionalInfo),
        });
      }

      return JSON.stringify({
        success: true,
        itemId: itemId,
        nutritionalInfo: nutrition,
        message: "Nutritional information retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get nutritional information",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_nutritional_info",
    description:
      "Get detailed nutritional information for a specific menu item",
    schema: z.object({
      itemId: z.string().describe("Menu item ID to get nutritional info for"),
    }),
  }
);

export const getAvailableItemsTool = tool(
  async (): Promise<string> => {
    try {
      const items = Object.keys(nutritionalInfo).map((itemId) => ({
        id: itemId,
        name: itemId
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        calories: nutritionalInfo[itemId].calories,
        allergens: nutritionalInfo[itemId].allergens,
      }));

      return JSON.stringify({
        success: true,
        items: items,
        totalCount: items.length,
        message: "Available menu items retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get available items",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_available_items",
    description:
      "Get all available McDonald's menu items with basic nutritional info",
    schema: z.object({}),
  }
);
