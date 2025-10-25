import { tool } from "@langchain/core/tools";
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
    deliveryFee: 2.99,
    minimumOrder: 15.0,
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
    deliveryFee: 1.99,
    minimumOrder: 12.0,
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
    deliveryFee: 3.99,
    minimumOrder: 20.0,
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
    deliveryFee: 1.5,
    minimumOrder: 10.0,
    location: {
      latitude: 40.7614,
      longitude: -73.9776,
      address: "321 Park Ave, New York, NY 10010",
      city: "New York",
      zipCode: "10010",
    },
    isOpen: false,
    imageUrl: "https://example.com/taco-fiesta.jpg",
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
