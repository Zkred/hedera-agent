import { tool } from "langchain";
import { z } from "zod";
import {
  PizzaSize,
  PizzaTopping,
  PizzaCustomization,
  MenuItem,
} from "../types";

// Pizza Hut specific data with HBAR pricing (1 HBAR = base unit)
const pizzaSizes: PizzaSize[] = [
  {
    id: "size_small",
    name: "Small",
    diameter: "10 inch",
    slices: 6,
    priceMultiplier: 1.0, // 1 HBAR base
  },
  {
    id: "size_medium",
    name: "Medium",
    diameter: "12 inch",
    slices: 8,
    priceMultiplier: 1.3, // 1.3 HBAR
  },
  {
    id: "size_large",
    name: "Large",
    diameter: "14 inch",
    slices: 10,
    priceMultiplier: 1.6, // 1.6 HBAR
  },
  {
    id: "size_extra_large",
    name: "Extra Large",
    diameter: "16 inch",
    slices: 12,
    priceMultiplier: 2.0, // 2 HBAR
  },
];

const pizzaToppings: PizzaTopping[] = [
  // Meat toppings
  {
    id: "topping_pepperoni",
    name: "Pepperoni",
    price: 0.2, // 0.2 HBAR
    category: "meat",
    isVegetarian: false,
  },
  {
    id: "topping_sausage",
    name: "Italian Sausage",
    price: 0.2,
    category: "meat",
    isVegetarian: false,
  },
  {
    id: "topping_ham",
    name: "Ham",
    price: 0.2,
    category: "meat",
    isVegetarian: false,
  },
  {
    id: "topping_bacon",
    name: "Bacon",
    price: 0.25,
    category: "meat",
    isVegetarian: false,
  },
  // Vegetable toppings
  {
    id: "topping_mushrooms",
    name: "Mushrooms",
    price: 0.15,
    category: "vegetable",
    isVegetarian: true,
  },
  {
    id: "topping_peppers",
    name: "Bell Peppers",
    price: 0.15,
    category: "vegetable",
    isVegetarian: true,
  },
  {
    id: "topping_onions",
    name: "Onions",
    price: 0.15,
    category: "vegetable",
    isVegetarian: true,
  },
  {
    id: "topping_olives",
    name: "Black Olives",
    price: 0.15,
    category: "vegetable",
    isVegetarian: true,
  },
  {
    id: "topping_tomatoes",
    name: "Fresh Tomatoes",
    price: 0.15,
    category: "vegetable",
    isVegetarian: true,
  },
  // Cheese toppings
  {
    id: "topping_extra_cheese",
    name: "Extra Cheese",
    price: 0.2,
    category: "cheese",
    isVegetarian: true,
  },
  {
    id: "topping_parmesan",
    name: "Parmesan",
    price: 0.2,
    category: "cheese",
    isVegetarian: true,
  },
];

const crustTypes = [
  { id: "crust_original", name: "Original Crust", price: 0 },
  { id: "crust_thin", name: "Thin Crust", price: 0 },
  { id: "crust_thick", name: "Thick Crust", price: 0.1 },
  { id: "crust_stuffed", name: "Stuffed Crust", price: 0.3 },
];

const sauceTypes = [
  { id: "sauce_tomato", name: "Tomato Sauce", price: 0 },
  { id: "sauce_bbq", name: "BBQ Sauce", price: 0.1 },
  { id: "sauce_alfredo", name: "Alfredo Sauce", price: 0.1 },
  { id: "sauce_pesto", name: "Pesto Sauce", price: 0.1 },
];

const cheeseTypes = [
  { id: "cheese_mozzarella", name: "Mozzarella", price: 0 },
  { id: "cheese_cheddar", name: "Cheddar", price: 0.1 },
  { id: "cheese_parmesan", name: "Parmesan", price: 0.1 },
  { id: "cheese_vegan", name: "Vegan Cheese", price: 0.2 },
];

export const createCustomPizzaTool = tool(
  async (args: PizzaCustomization): Promise<string> => {
    try {
      // Find the selected size
      const selectedSize = pizzaSizes.find((size) => size.id === args.size);
      if (!selectedSize) {
        return JSON.stringify({
          error: "Invalid pizza size selected",
          availableSizes: pizzaSizes.map((s) => ({ id: s.id, name: s.name })),
        });
      }

      // Find the selected crust
      const selectedCrust = crustTypes.find((crust) => crust.id === args.crust);
      if (!selectedCrust) {
        return JSON.stringify({
          error: "Invalid crust type selected",
          availableCrusts: crustTypes.map((c) => ({ id: c.id, name: c.name })),
        });
      }

      // Find the selected sauce
      const selectedSauce = sauceTypes.find((sauce) => sauce.id === args.sauce);
      if (!selectedSauce) {
        return JSON.stringify({
          error: "Invalid sauce type selected",
          availableSauces: sauceTypes.map((s) => ({ id: s.id, name: s.name })),
        });
      }

      // Find the selected cheese
      const selectedCheese = cheeseTypes.find(
        (cheese) => cheese.id === args.cheese
      );
      if (!selectedCheese) {
        return JSON.stringify({
          error: "Invalid cheese type selected",
          availableCheeses: cheeseTypes.map((c) => ({
            id: c.id,
            name: c.name,
          })),
        });
      }

      // Validate toppings
      const selectedToppings = args.toppings.map((toppingId) => {
        const topping = pizzaToppings.find((t) => t.id === toppingId);
        if (!topping) {
          throw new Error(`Invalid topping: ${toppingId}`);
        }
        return topping;
      });

      // Validate extra toppings
      const selectedExtraToppings = args.extraToppings.map((toppingId) => {
        const topping = pizzaToppings.find((t) => t.id === toppingId);
        if (!topping) {
          throw new Error(`Invalid extra topping: ${toppingId}`);
        }
        return topping;
      });

      // Calculate total price
      let totalPrice = selectedSize.priceMultiplier; // Base price for size
      totalPrice += selectedCrust.price;
      totalPrice += selectedSauce.price;
      totalPrice += selectedCheese.price;

      // Add topping prices
      selectedToppings.forEach((topping) => {
        totalPrice += topping.price;
      });

      // Add extra topping prices (double for extra)
      selectedExtraToppings.forEach((topping) => {
        totalPrice += topping.price * 2;
      });

      const customPizza = {
        id: `custom_pizza_${Date.now()}`,
        name: `Custom ${selectedSize.name} Pizza`,
        description: `${selectedSize.name} pizza with ${selectedCrust.name} crust, ${selectedSauce.name} sauce, ${selectedCheese.name} cheese, and selected toppings`,
        price: totalPrice,
        size: selectedSize,
        crust: selectedCrust,
        sauce: selectedSauce,
        cheese: selectedCheese,
        toppings: selectedToppings,
        extraToppings: selectedExtraToppings,
        totalToppings: selectedToppings.length + selectedExtraToppings.length,
        isVegetarian:
          selectedToppings.every((t) => t.isVegetarian) &&
          selectedExtraToppings.every((t) => t.isVegetarian),
        estimatedPrepTime: "15-20 minutes",
      };

      return JSON.stringify({
        success: true,
        customPizza: customPizza,
        message: `Custom pizza created successfully! Total price: ${totalPrice} HBAR`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to create custom pizza",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "create_custom_pizza",
    description:
      "Create a custom pizza with selected size, crust, sauce, cheese, and toppings",
    schema: z.object({
      size: z.string().describe("Pizza size ID"),
      crust: z.string().describe("Crust type ID"),
      sauce: z.string().describe("Sauce type ID"),
      cheese: z.string().describe("Cheese type ID"),
      toppings: z.array(z.string()).describe("Array of topping IDs"),
      extraToppings: z.array(z.string()).describe("Array of extra topping IDs"),
    }),
  }
);

export const getPizzaSizesTool = tool(
  async (): Promise<string> => {
    try {
      return JSON.stringify({
        success: true,
        sizes: pizzaSizes,
        message: "Available pizza sizes retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get pizza sizes",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_pizza_sizes",
    description: "Get all available pizza sizes with pricing",
    schema: z.object({}),
  }
);

export const getPizzaToppingsTool = tool(
  async (args: {
    category?: string;
    vegetarianOnly?: boolean;
  }): Promise<string> => {
    try {
      let filteredToppings = [...pizzaToppings];

      if (args.category) {
        filteredToppings = filteredToppings.filter(
          (topping) => topping.category === args.category
        );
      }

      if (args.vegetarianOnly) {
        filteredToppings = filteredToppings.filter(
          (topping) => topping.isVegetarian
        );
      }

      return JSON.stringify({
        success: true,
        toppings: filteredToppings,
        totalCount: filteredToppings.length,
        message: "Available pizza toppings retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get pizza toppings",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_pizza_toppings",
    description:
      "Get available pizza toppings, optionally filtered by category or vegetarian status",
    schema: z.object({
      category: z
        .string()
        .optional()
        .describe("Filter by topping category (meat, vegetable, cheese)"),
      vegetarianOnly: z
        .boolean()
        .optional()
        .describe("Show only vegetarian toppings"),
    }),
  }
);

export const getCrustTypesTool = tool(
  async (): Promise<string> => {
    try {
      return JSON.stringify({
        success: true,
        crustTypes: crustTypes,
        message: "Available crust types retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get crust types",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_crust_types",
    description: "Get all available pizza crust types with pricing",
    schema: z.object({}),
  }
);
