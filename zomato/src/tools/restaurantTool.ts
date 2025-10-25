import { tool } from "langchain";
import { z } from "zod";
import {
  Restaurant,
  RestaurantSearchRequest,
  RestaurantSearchResponse,
  Location,
} from "../types";

// Mock restaurant data for demonstration
const mockRestaurants: Restaurant[] = [
  {
    id: "rest_001",
    name: "Pizza Palace",
    cuisine: ["Italian", "Pizza"],
    rating: 4.5,
    deliveryTime: "25-35 mins",
    deliveryFee: 0.1, // 0.1 HBAR
    minimumOrder: 1.0, // 1 HBAR
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "123 Main St, New York, NY 10001",
      city: "New York",
      zipCode: "10001",
    },
    isOpen: true,
    imageUrl: "https://example.com/pizza-palace.jpg",
  },
  {
    id: "rest_002",
    name: "Burger Barn",
    cuisine: ["American", "Burgers"],
    rating: 4.2,
    deliveryTime: "20-30 mins",
    deliveryFee: 0.08, // 0.08 HBAR
    minimumOrder: 0.8, // 0.8 HBAR
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: "456 Broadway, New York, NY 10013",
      city: "New York",
      zipCode: "10013",
    },
    isOpen: true,
    imageUrl: "https://example.com/burger-barn.jpg",
  },
  {
    id: "rest_003",
    name: "Sushi Express",
    cuisine: ["Japanese", "Sushi"],
    rating: 4.7,
    deliveryTime: "30-40 mins",
    deliveryFee: 0.12, // 0.12 HBAR
    minimumOrder: 1.2, // 1.2 HBAR
    location: {
      latitude: 40.7505,
      longitude: -73.9934,
      address: "789 5th Ave, New York, NY 10022",
      city: "New York",
      zipCode: "10022",
    },
    isOpen: true,
    imageUrl: "https://example.com/sushi-express.jpg",
  },
  {
    id: "rest_004",
    name: "Taco Fiesta",
    cuisine: ["Mexican", "Tacos"],
    rating: 4.0,
    deliveryTime: "15-25 mins",
    deliveryFee: 0.06, // 0.06 HBAR
    minimumOrder: 0.6, // 0.6 HBAR
    location: {
      latitude: 40.7614,
      longitude: -73.9776,
      address: "321 Park Ave, New York, NY 10010",
      city: "New York",
      zipCode: "10010",
    },
    isOpen: true, // Changed to true
    imageUrl: "https://example.com/taco-fiesta.jpg",
  },
  // Partner Restaurant Locations
  {
    id: "rest_005",
    name: "Pizza Hut - Times Square",
    cuisine: ["Pizza", "Italian", "American"],
    rating: 4.3,
    deliveryTime: "20-30 mins",
    deliveryFee: 0.09, // 0.09 HBAR
    minimumOrder: 0.9, // 0.9 HBAR
    location: {
      latitude: 40.758,
      longitude: -73.9855,
      address: "123 Main St, New York, NY 10001", // Same as user's address
      city: "New York",
      zipCode: "10001",
    },
    isOpen: true,
    imageUrl: "https://example.com/pizza-hut.jpg",
  },
  {
    id: "rest_006",
    name: "Pizza Hut - Downtown",
    cuisine: ["Pizza", "Italian", "American"],
    rating: 4.1,
    deliveryTime: "25-35 mins",
    deliveryFee: 0.11, // 0.11 HBAR
    minimumOrder: 0.8, // 0.8 HBAR
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "456 Broadway, New York, NY 10013",
      city: "New York",
      zipCode: "10013",
    },
    isOpen: true,
    imageUrl: "https://example.com/pizza-hut-downtown.jpg",
  },
  {
    id: "rest_007",
    name: "McDonald's - Midtown",
    cuisine: ["American", "Fast Food", "Burgers"],
    rating: 4.0,
    deliveryTime: "15-25 mins",
    deliveryFee: 0.07, // 0.07 HBAR
    minimumOrder: 0.7, // 0.7 HBAR
    location: {
      latitude: 40.7505,
      longitude: -73.9934,
      address: "789 5th Ave, New York, NY 10022",
      city: "New York",
      zipCode: "10022",
    },
    isOpen: true,
    imageUrl: "https://example.com/mcdonalds.jpg",
  },
  {
    id: "rest_008",
    name: "McDonald's - Financial District",
    cuisine: ["American", "Fast Food", "Burgers"],
    rating: 4.2,
    deliveryTime: "20-30 mins",
    deliveryFee: 0.08, // 0.08 HBAR
    minimumOrder: 0.6, // 0.6 HBAR
    location: {
      latitude: 40.7074,
      longitude: -74.0113,
      address: "123 Main St, New York, NY 10001", // Same as user's address
      city: "New York",
      zipCode: "10001",
    },
    isOpen: true,
    imageUrl: "https://example.com/mcdonalds-financial.jpg",
  },
  // Additional restaurants for better coverage
  {
    id: "rest_009",
    name: "Pizza Corner",
    cuisine: ["Pizza", "Italian"],
    rating: 4.4,
    deliveryTime: "25-35 mins",
    deliveryFee: 0.1, // 0.10 HBAR
    minimumOrder: 0.9, // 0.9 HBAR
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "123 Main St, New York, NY 10001", // Same as user's address
      city: "New York",
      zipCode: "10001",
    },
    isOpen: true,
    imageUrl: "https://example.com/pizza-corner.jpg",
  },
  {
    id: "rest_010",
    name: "Burger King - Union Square",
    cuisine: ["American", "Fast Food", "Burgers"],
    rating: 3.9,
    deliveryTime: "20-30 mins",
    deliveryFee: 0.08, // 0.08 HBAR
    minimumOrder: 0.8, // 0.8 HBAR
    location: {
      latitude: 40.7359,
      longitude: -73.9911,
      address: "Union Square, New York, NY 10003",
      city: "New York",
      zipCode: "10003",
    },
    isOpen: true,
    imageUrl: "https://example.com/burger-king.jpg",
  },
];

export const restaurantSearchTool = tool(
  async (args: RestaurantSearchRequest): Promise<string> => {
    try {
      let filteredRestaurants = [...mockRestaurants];

      // Filter by cuisine
      if (args.cuisine) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) =>
          restaurant.cuisine.some((c) =>
            c.toLowerCase().includes(args.cuisine!.toLowerCase())
          )
        );
      }

      // Filter by minimum rating
      if (args.minRating) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) => restaurant.rating >= args.minRating!
        );
      }

      // Filter by maximum delivery fee
      if (args.maxDeliveryFee) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) => restaurant.deliveryFee <= args.maxDeliveryFee!
        );
      }

      // Filter by maximum delivery time (simplified - just check if delivery time is reasonable)
      if (args.maxDeliveryTime) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) => {
          const maxTime = args.maxDeliveryTime!;
          const deliveryTimeMatch =
            restaurant.deliveryTime.match(/(\d+)-(\d+)/);
          if (deliveryTimeMatch) {
            const maxDeliveryTime = parseInt(deliveryTimeMatch[2]);
            return maxDeliveryTime <= maxTime;
          }
          return true;
        });
      }

      // Filter out closed restaurants
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.isOpen
      );

      // Fallback: If no restaurants found due to strict filters, return some open restaurants
      if (filteredRestaurants.length === 0) {
        console.log(
          "No restaurants found with current filters, returning fallback restaurants"
        );
        filteredRestaurants = mockRestaurants
          .filter((restaurant) => restaurant.isOpen)
          .slice(0, 5);
      }

      // Ensure we always have at least some restaurants
      if (filteredRestaurants.length === 0) {
        console.log("No open restaurants found, returning default restaurants");
        filteredRestaurants = [
          {
            id: "rest_fallback_001",
            name: "Pizza Hut - Always Available",
            cuisine: ["Pizza", "Italian", "American"],
            rating: 4.0,
            deliveryTime: "25-35 mins",
            deliveryFee: 0.1,
            minimumOrder: 0.8,
            location: {
              latitude: 40.7128,
              longitude: -74.006,
              address: "123 Main St, New York, NY 10001",
              city: "New York",
              zipCode: "10001",
            },
            isOpen: true,
            imageUrl: "https://example.com/pizza-hut-fallback.jpg",
          },
          {
            id: "rest_fallback_002",
            name: "McDonald's - Always Available",
            cuisine: ["American", "Fast Food", "Burgers"],
            rating: 4.0,
            deliveryTime: "20-30 mins",
            deliveryFee: 0.08,
            minimumOrder: 0.6,
            location: {
              latitude: 40.7128,
              longitude: -74.006,
              address: "123 Main St, New York, NY 10001",
              city: "New York",
              zipCode: "10001",
            },
            isOpen: true,
            imageUrl: "https://example.com/mcdonalds-fallback.jpg",
          },
        ];
      }

      const response: RestaurantSearchResponse = {
        restaurants: filteredRestaurants,
        totalCount: filteredRestaurants.length,
      };

      return JSON.stringify(response);
    } catch (error) {
      return JSON.stringify({
        error: "Failed to search restaurants",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "search_restaurants",
    description:
      "Search for restaurants near a location with optional filters for cuisine, rating, delivery time, and delivery fee",
    schema: z.object({
      location: z
        .object({
          latitude: z.number().describe("Latitude coordinate"),
          longitude: z.number().describe("Longitude coordinate"),
          address: z.string().optional().describe("Full address (optional)"),
          city: z.string().optional().describe("City name (optional)"),
          zipCode: z.string().optional().describe("ZIP code (optional)"),
        })
        .describe("Location coordinates"),
      cuisine: z
        .string()
        .optional()
        .describe(
          "Filter by cuisine type (e.g., 'Italian', 'Chinese', 'Mexican')"
        ),
      maxDeliveryTime: z
        .number()
        .optional()
        .describe("Maximum delivery time in minutes"),
      minRating: z
        .number()
        .optional()
        .describe("Minimum restaurant rating (1-5)"),
      maxDeliveryFee: z.number().optional().describe("Maximum delivery fee"),
    }),
  }
);

export const getRestaurantDetailsTool = tool(
  async (args: { restaurantId: string }): Promise<string> => {
    try {
      const restaurant = mockRestaurants.find(
        (r) => r.id === args.restaurantId
      );

      if (!restaurant) {
        return JSON.stringify({
          error: "Restaurant not found",
          restaurantId: args.restaurantId,
        });
      }

      return JSON.stringify(restaurant);
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get restaurant details",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_restaurant_details",
    description: "Get detailed information about a specific restaurant",
    schema: z.object({
      restaurantId: z
        .string()
        .describe("The unique identifier of the restaurant"),
    }),
  }
);
