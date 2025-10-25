import { tool } from "langchain";
import { z } from "zod";
import { McDeliveryPoints, McDeliveryReward } from "../types";

// Mock McDelivery rewards data
let mcDeliveryPoints: { [customerId: string]: McDeliveryPoints } = {};

// Available rewards
const availableRewards: McDeliveryReward[] = [
  {
    id: "reward_free_fries",
    name: "Free Medium Fries",
    description: "Get a free medium fries with any purchase",
    pointsRequired: 100,
    discountType: "fixed",
    discountValue: 0.3, // 0.3 HBAR value
    isActive: true,
  },
  {
    id: "reward_free_drink",
    name: "Free Medium Drink",
    description: "Get a free medium drink with any purchase",
    pointsRequired: 150,
    discountType: "fixed",
    discountValue: 0.4, // 0.4 HBAR value
    isActive: true,
  },
  {
    id: "reward_10_percent_off",
    name: "10% Off Next Order",
    description: "Get 10% off your next order",
    pointsRequired: 200,
    discountType: "percentage",
    discountValue: 10,
    isActive: true,
  },
  {
    id: "reward_free_burger",
    name: "Free Burger",
    description: "Get a free burger (up to 1 HBAR value)",
    pointsRequired: 300,
    discountType: "fixed",
    discountValue: 1.0, // 1 HBAR value
    isActive: true,
  },
  {
    id: "reward_20_percent_off",
    name: "20% Off Next Order",
    description: "Get 20% off your next order",
    pointsRequired: 500,
    discountType: "percentage",
    discountValue: 20,
    isActive: true,
  },
  {
    id: "reward_free_combo",
    name: "Free Combo Meal",
    description: "Get a free combo meal (up to 1.5 HBAR value)",
    pointsRequired: 750,
    discountType: "fixed",
    discountValue: 1.5, // 1.5 HBAR value
    isActive: true,
  },
];

export const getMcDeliveryPointsTool = tool(
  async (args: { customerId: string }): Promise<string> => {
    try {
      const { customerId } = args;

      if (!mcDeliveryPoints[customerId]) {
        // Initialize new customer
        mcDeliveryPoints[customerId] = {
          customerId: customerId,
          currentPoints: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: "Bronze",
          nextReward: null,
        };
      }

      const points = mcDeliveryPoints[customerId];

      // Find next available reward
      const nextReward = availableRewards
        .filter(
          (reward) =>
            reward.isActive && points.currentPoints >= reward.pointsRequired
        )
        .sort((a, b) => a.pointsRequired - b.pointsRequired)[0];

      points.nextReward = nextReward || null;

      return JSON.stringify({
        success: true,
        points: points,
        availableRewards: availableRewards.filter((reward) => reward.isActive),
        message: "McDelivery points retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get McDelivery points",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_mc_delivery_points",
    description: "Get customer McDelivery points and available rewards",
    schema: z.object({
      customerId: z
        .string()
        .describe("Customer ID to look up McDelivery points"),
    }),
  }
);

export const earnMcDeliveryPointsTool = tool(
  async (args: {
    customerId: string;
    points: number;
    orderId?: string;
  }): Promise<string> => {
    try {
      const { customerId, points, orderId } = args;

      if (!mcDeliveryPoints[customerId]) {
        mcDeliveryPoints[customerId] = {
          customerId: customerId,
          currentPoints: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: "Bronze",
          nextReward: null,
        };
      }

      const customerPoints = mcDeliveryPoints[customerId];

      // Earn points (1 point per HBAR spent, rounded down)
      const earnedPoints = Math.floor(points);

      // Update points
      customerPoints.currentPoints += earnedPoints;
      customerPoints.totalEarned += earnedPoints;

      // Check for new available rewards
      const newRewards = availableRewards.filter(
        (reward) =>
          reward.isActive &&
          customerPoints.currentPoints >= reward.pointsRequired &&
          (customerPoints.nextReward === null ||
            customerPoints.currentPoints >=
              customerPoints.nextReward.pointsRequired)
      );

      if (newRewards.length > 0) {
        customerPoints.nextReward = newRewards.sort(
          (a, b) => a.pointsRequired - b.pointsRequired
        )[0];
      }

      return JSON.stringify({
        success: true,
        points: customerPoints,
        earnedPoints: earnedPoints,
        newRewardsAvailable: newRewards.length,
        message: `Earned ${earnedPoints} McDelivery points!`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to earn McDelivery points",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "earn_mc_delivery_points",
    description:
      "Add McDelivery points to customer account based on order value",
    schema: z.object({
      customerId: z.string().describe("Customer ID"),
      points: z
        .number()
        .describe("Points to earn (typically 1 point per HBAR spent)"),
      orderId: z.string().optional().describe("Associated order ID"),
    }),
  }
);

export const redeemMcDeliveryRewardTool = tool(
  async (args: { customerId: string; rewardId: string }): Promise<string> => {
    try {
      const { customerId, rewardId } = args;

      if (!mcDeliveryPoints[customerId]) {
        return JSON.stringify({
          error: "Customer not found in McDelivery program",
          customerId: customerId,
        });
      }

      const customerPoints = mcDeliveryPoints[customerId];
      const reward = availableRewards.find((r) => r.id === rewardId);

      if (!reward) {
        return JSON.stringify({
          error: "Reward not found",
          rewardId: rewardId,
          availableRewards: availableRewards.map((r) => ({
            id: r.id,
            name: r.name,
            pointsRequired: r.pointsRequired,
          })),
        });
      }

      if (!reward.isActive) {
        return JSON.stringify({
          error: "Reward is not currently active",
          rewardId: rewardId,
        });
      }

      if (customerPoints.currentPoints < reward.pointsRequired) {
        return JSON.stringify({
          error: "Insufficient McDelivery points",
          currentPoints: customerPoints.currentPoints,
          requiredPoints: reward.pointsRequired,
          shortfall: reward.pointsRequired - customerPoints.currentPoints,
        });
      }

      // Redeem reward
      customerPoints.currentPoints -= reward.pointsRequired;
      customerPoints.totalRedeemed += reward.pointsRequired;

      // Update next reward
      const nextReward = availableRewards
        .filter(
          (r) => r.isActive && customerPoints.currentPoints >= r.pointsRequired
        )
        .sort((a, b) => a.pointsRequired - b.pointsRequired)[0];

      customerPoints.nextReward = nextReward || null;

      return JSON.stringify({
        success: true,
        points: customerPoints,
        redeemedReward: reward,
        message: `Successfully redeemed ${reward.name}!`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to redeem McDelivery reward",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "redeem_mc_delivery_reward",
    description: "Redeem a McDelivery reward using customer points",
    schema: z.object({
      customerId: z.string().describe("Customer ID"),
      rewardId: z.string().describe("Reward ID to redeem"),
    }),
  }
);

export const getAvailableRewardsTool = tool(
  async (args: { customerId?: string }): Promise<string> => {
    try {
      let filteredRewards = availableRewards.filter(
        (reward) => reward.isActive
      );

      // If customer ID provided, show only rewards they can afford
      if (args.customerId && mcDeliveryPoints[args.customerId]) {
        const customerPoints = mcDeliveryPoints[args.customerId];
        filteredRewards = filteredRewards.filter(
          (reward) => customerPoints.currentPoints >= reward.pointsRequired
        );
      }

      return JSON.stringify({
        success: true,
        rewards: filteredRewards,
        totalCount: filteredRewards.length,
        message: "Available McDelivery rewards retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get available rewards",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_available_rewards",
    description:
      "Get available McDelivery rewards, optionally filtered by customer points",
    schema: z.object({
      customerId: z
        .string()
        .optional()
        .describe("Customer ID to filter rewards by available points"),
    }),
  }
);

export const createMcDeliveryRewardTool = tool(
  async (args: {
    name: string;
    description: string;
    pointsRequired: number;
    discountType: "percentage" | "fixed";
    discountValue: number;
    isActive?: boolean;
  }): Promise<string> => {
    try {
      const {
        name,
        description,
        pointsRequired,
        discountType,
        discountValue,
        isActive = true,
      } = args;

      // Validate inputs
      if (pointsRequired <= 0) {
        return JSON.stringify({
          error: "Points required must be greater than 0",
          pointsRequired: pointsRequired,
        });
      }

      if (discountValue <= 0) {
        return JSON.stringify({
          error: "Discount value must be greater than 0",
          discountValue: discountValue,
        });
      }

      // Create new reward
      const newReward: McDeliveryReward = {
        id: `reward_${Date.now()}`,
        name: name,
        description: description,
        pointsRequired: pointsRequired,
        discountType: discountType,
        discountValue: discountValue,
        isActive: isActive,
      };

      availableRewards.push(newReward);

      return JSON.stringify({
        success: true,
        reward: newReward,
        message: `McDelivery reward '${name}' created successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to create McDelivery reward",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "create_mc_delivery_reward",
    description: "Create a new McDelivery reward",
    schema: z.object({
      name: z.string().describe("Reward name"),
      description: z.string().describe("Reward description"),
      pointsRequired: z.number().describe("Points required to redeem"),
      discountType: z
        .enum(["percentage", "fixed"])
        .describe("Type of discount"),
      discountValue: z.number().describe("Discount value"),
      isActive: z.boolean().optional().describe("Whether the reward is active"),
    }),
  }
);
