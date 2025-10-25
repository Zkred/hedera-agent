import { tool } from "langchain";
import { z } from "zod";
import { LoyaltyPoints } from "../types";

// Mock loyalty data storage
let loyaltyData: { [customerId: string]: LoyaltyPoints } = {};

// Loyalty tier definitions
const loyaltyTiers = [
  { name: "Bronze", minPoints: 0, maxPoints: 99, multiplier: 1.0 },
  { name: "Silver", minPoints: 100, maxPoints: 299, multiplier: 1.1 },
  { name: "Gold", minPoints: 300, maxPoints: 599, multiplier: 1.2 },
  { name: "Platinum", minPoints: 600, maxPoints: 999, multiplier: 1.3 },
  { name: "Diamond", minPoints: 1000, maxPoints: Infinity, multiplier: 1.5 },
];

export const getLoyaltyPointsTool = tool(
  async (args: { customerId: string }): Promise<string> => {
    try {
      const customerId = args.customerId;

      if (!loyaltyData[customerId]) {
        // Initialize new customer
        loyaltyData[customerId] = {
          customerId: customerId,
          currentPoints: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: "Bronze",
        };
      }

      const loyalty = loyaltyData[customerId];

      // Determine current tier
      const currentTier = loyaltyTiers.find(
        (tier) =>
          loyalty.currentPoints >= tier.minPoints &&
          loyalty.currentPoints <= tier.maxPoints
      );

      if (currentTier && currentTier.name !== loyalty.tier) {
        loyalty.tier = currentTier.name;
      }

      return JSON.stringify({
        success: true,
        loyalty: loyalty,
        currentTier: currentTier,
        nextTier: loyaltyTiers.find(
          (tier) => tier.minPoints > loyalty.currentPoints
        ),
        message: "Loyalty points retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get loyalty points",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_loyalty_points",
    description: "Get customer loyalty points, tier, and rewards information",
    schema: z.object({
      customerId: z
        .string()
        .describe("Customer ID to look up loyalty information"),
    }),
  }
);

export const earnLoyaltyPointsTool = tool(
  async (args: {
    customerId: string;
    points: number;
    orderId?: string;
  }): Promise<string> => {
    try {
      const { customerId, points, orderId } = args;

      if (!loyaltyData[customerId]) {
        loyaltyData[customerId] = {
          customerId: customerId,
          currentPoints: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: "Bronze",
        };
      }

      const loyalty = loyaltyData[customerId];

      // Apply tier multiplier
      const currentTier = loyaltyTiers.find(
        (tier) =>
          loyalty.currentPoints >= tier.minPoints &&
          loyalty.currentPoints <= tier.maxPoints
      );

      const multiplier = currentTier ? currentTier.multiplier : 1.0;
      const earnedPoints = Math.floor(points * multiplier);

      // Update loyalty data
      loyalty.currentPoints += earnedPoints;
      loyalty.totalEarned += earnedPoints;

      // Check for tier upgrade
      const newTier = loyaltyTiers.find(
        (tier) =>
          loyalty.currentPoints >= tier.minPoints &&
          loyalty.currentPoints <= tier.maxPoints
      );

      if (newTier && newTier.name !== loyalty.tier) {
        loyalty.tier = newTier.name;
      }

      return JSON.stringify({
        success: true,
        loyalty: loyalty,
        earnedPoints: earnedPoints,
        multiplier: multiplier,
        tierUpgrade: newTier && newTier.name !== loyalty.tier,
        message: `Earned ${earnedPoints} loyalty points (${multiplier}x multiplier applied)`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to earn loyalty points",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "earn_loyalty_points",
    description:
      "Add loyalty points to customer account with tier-based multiplier",
    schema: z.object({
      customerId: z.string().describe("Customer ID"),
      points: z.number().describe("Base points to earn"),
      orderId: z.string().optional().describe("Associated order ID"),
    }),
  }
);

export const redeemLoyaltyPointsTool = tool(
  async (args: {
    customerId: string;
    points: number;
    reason?: string;
  }): Promise<string> => {
    try {
      const { customerId, points, reason } = args;

      if (!loyaltyData[customerId]) {
        return JSON.stringify({
          error: "Customer not found in loyalty program",
          customerId: customerId,
        });
      }

      const loyalty = loyaltyData[customerId];

      if (loyalty.currentPoints < points) {
        return JSON.stringify({
          error: "Insufficient loyalty points",
          currentPoints: loyalty.currentPoints,
          requestedPoints: points,
          shortfall: points - loyalty.currentPoints,
        });
      }

      // Redeem points
      loyalty.currentPoints -= points;
      loyalty.totalRedeemed += points;

      // Check for tier downgrade
      const newTier = loyaltyTiers.find(
        (tier) =>
          loyalty.currentPoints >= tier.minPoints &&
          loyalty.currentPoints <= tier.maxPoints
      );

      if (newTier && newTier.name !== loyalty.tier) {
        loyalty.tier = newTier.name;
      }

      return JSON.stringify({
        success: true,
        loyalty: loyalty,
        redeemedPoints: points,
        reason: reason || "Points redemption",
        tierChange: newTier && newTier.name !== loyalty.tier,
        message: `Successfully redeemed ${points} loyalty points`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to redeem loyalty points",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "redeem_loyalty_points",
    description: "Redeem loyalty points from customer account",
    schema: z.object({
      customerId: z.string().describe("Customer ID"),
      points: z.number().describe("Points to redeem"),
      reason: z.string().optional().describe("Reason for redemption"),
    }),
  }
);

export const getLoyaltyTiersTool = tool(
  async (): Promise<string> => {
    try {
      return JSON.stringify({
        success: true,
        tiers: loyaltyTiers,
        message: "Loyalty tiers retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get loyalty tiers",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_loyalty_tiers",
    description:
      "Get all available loyalty tiers with requirements and benefits",
    schema: z.object({}),
  }
);
