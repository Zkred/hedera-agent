import { tool } from "langchain";
import { z } from "zod";
import { PromoCode } from "../types";

// Mock promo code storage
let promoCodes: { [code: string]: PromoCode } = {};

// Initialize with some sample promo codes
const initializePromoCodes = () => {
  promoCodes = {
    WELCOME10: {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      minimumOrder: 1.0, // 1 HBAR minimum
      validUntil: "2024-12-31T23:59:59Z",
      isActive: true,
    },
    PIZZA20: {
      code: "PIZZA20",
      discountType: "percentage",
      discountValue: 20,
      minimumOrder: 2.0, // 2 HBAR minimum
      validUntil: "2024-12-31T23:59:59Z",
      isActive: true,
    },
    SAVE5: {
      code: "SAVE5",
      discountType: "fixed",
      discountValue: 0.5, // 0.5 HBAR off
      minimumOrder: 1.5, // 1.5 HBAR minimum
      validUntil: "2024-12-31T23:59:59Z",
      isActive: true,
    },
    NEWUSER: {
      code: "NEWUSER",
      discountType: "percentage",
      discountValue: 15,
      minimumOrder: 1.0,
      validUntil: "2024-12-31T23:59:59Z",
      isActive: true,
    },
    LOYALTY: {
      code: "LOYALTY",
      discountType: "percentage",
      discountValue: 25,
      minimumOrder: 3.0, // 3 HBAR minimum
      validUntil: "2024-12-31T23:59:59Z",
      isActive: true,
    },
  };
};

// Initialize promo codes
initializePromoCodes();

export const validatePromoCodeTool = tool(
  async (args: { code: string; orderTotal: number }): Promise<string> => {
    try {
      const { code, orderTotal } = args;
      const promoCode = promoCodes[code.toUpperCase()];

      if (!promoCode) {
        return JSON.stringify({
          error: "Promo code not found",
          code: code,
          availableCodes: Object.keys(promoCodes).filter(
            (c) => promoCodes[c].isActive
          ),
        });
      }

      if (!promoCode.isActive) {
        return JSON.stringify({
          error: "Promo code is not active",
          code: code,
        });
      }

      // Check if promo code is still valid
      const now = new Date();
      const validUntil = new Date(promoCode.validUntil);

      if (now > validUntil) {
        return JSON.stringify({
          error: "Promo code has expired",
          code: code,
          expiredAt: promoCode.validUntil,
        });
      }

      // Check minimum order requirement
      if (orderTotal < promoCode.minimumOrder) {
        return JSON.stringify({
          error: "Order total below minimum requirement",
          code: code,
          orderTotal: orderTotal,
          minimumOrder: promoCode.minimumOrder,
          shortfall: promoCode.minimumOrder - orderTotal,
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (promoCode.discountType === "percentage") {
        discountAmount = (orderTotal * promoCode.discountValue) / 100;
      } else if (promoCode.discountType === "fixed") {
        discountAmount = promoCode.discountValue;
      }

      // Ensure discount doesn't exceed order total
      discountAmount = Math.min(discountAmount, orderTotal);

      const finalTotal = orderTotal - discountAmount;

      return JSON.stringify({
        success: true,
        promoCode: promoCode,
        originalTotal: orderTotal,
        discountAmount: discountAmount,
        finalTotal: finalTotal,
        savings: discountAmount,
        message: `Promo code applied successfully! You saved ${discountAmount} HBAR`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to validate promo code",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "validate_promo_code",
    description: "Validate a promo code and calculate discount for an order",
    schema: z.object({
      code: z.string().describe("Promo code to validate"),
      orderTotal: z.number().describe("Total order amount in HBAR"),
    }),
  }
);

export const createPromoCodeTool = tool(
  async (args: {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minimumOrder: number;
    validUntil: string;
    isActive?: boolean;
  }): Promise<string> => {
    try {
      const {
        code,
        discountType,
        discountValue,
        minimumOrder,
        validUntil,
        isActive = true,
      } = args;

      // Check if code already exists
      if (promoCodes[code.toUpperCase()]) {
        return JSON.stringify({
          error: "Promo code already exists",
          code: code,
        });
      }

      // Validate discount value
      if (discountValue <= 0) {
        return JSON.stringify({
          error: "Discount value must be greater than 0",
          discountValue: discountValue,
        });
      }

      // Validate minimum order
      if (minimumOrder < 0) {
        return JSON.stringify({
          error: "Minimum order must be 0 or greater",
          minimumOrder: minimumOrder,
        });
      }

      // Validate date
      const validUntilDate = new Date(validUntil);
      if (isNaN(validUntilDate.getTime())) {
        return JSON.stringify({
          error: "Invalid date format for validUntil",
          validUntil: validUntil,
        });
      }

      // Create new promo code
      const newPromoCode: PromoCode = {
        code: code.toUpperCase(),
        discountType: discountType,
        discountValue: discountValue,
        minimumOrder: minimumOrder,
        validUntil: validUntil,
        isActive: isActive,
      };

      promoCodes[code.toUpperCase()] = newPromoCode;

      return JSON.stringify({
        success: true,
        promoCode: newPromoCode,
        message: `Promo code '${code}' created successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to create promo code",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "create_promo_code",
    description:
      "Create a new promotional code with discount and validity settings",
    schema: z.object({
      code: z.string().describe("Promo code string"),
      discountType: z
        .enum(["percentage", "fixed"])
        .describe("Type of discount"),
      discountValue: z
        .number()
        .describe("Discount value (percentage or fixed amount)"),
      minimumOrder: z.number().describe("Minimum order amount required"),
      validUntil: z.string().describe("Expiration date (ISO format)"),
      isActive: z.boolean().optional().describe("Whether the code is active"),
    }),
  }
);

export const getActivePromoCodesTool = tool(
  async (): Promise<string> => {
    try {
      const now = new Date();
      const activeCodes = Object.values(promoCodes).filter((code) => {
        const validUntil = new Date(code.validUntil);
        return code.isActive && now <= validUntil;
      });

      return JSON.stringify({
        success: true,
        activeCodes: activeCodes,
        totalCount: activeCodes.length,
        message: "Active promo codes retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get active promo codes",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_active_promo_codes",
    description: "Get all currently active and valid promo codes",
    schema: z.object({}),
  }
);

export const deactivatePromoCodeTool = tool(
  async (args: { code: string }): Promise<string> => {
    try {
      const { code } = args;
      const promoCode = promoCodes[code.toUpperCase()];

      if (!promoCode) {
        return JSON.stringify({
          error: "Promo code not found",
          code: code,
        });
      }

      promoCode.isActive = false;

      return JSON.stringify({
        success: true,
        promoCode: promoCode,
        message: `Promo code '${code}' deactivated successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to deactivate promo code",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "deactivate_promo_code",
    description: "Deactivate a promo code",
    schema: z.object({
      code: z.string().describe("Promo code to deactivate"),
    }),
  }
);
