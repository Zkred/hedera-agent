import { tool } from "langchain";
import { z } from "zod";
import { DriveThruSlot } from "../types";

// Mock drive-thru slots data
let driveThruSlots: DriveThruSlot[] = [
  {
    id: "slot_001",
    slotNumber: "1",
    isAvailable: true,
    estimatedWaitTime: 3,
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "123 Main St, New York, NY 10001",
      city: "New York",
      zipCode: "10001",
    },
  },
  {
    id: "slot_002",
    slotNumber: "2",
    isAvailable: true,
    estimatedWaitTime: 5,
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: "456 Broadway, New York, NY 10013",
      city: "New York",
      zipCode: "10013",
    },
  },
  {
    id: "slot_003",
    slotNumber: "3",
    isAvailable: false,
    estimatedWaitTime: 8,
    location: {
      latitude: 40.7505,
      longitude: -73.9934,
      address: "789 5th Ave, New York, NY 10022",
      city: "New York",
      zipCode: "10022",
    },
  },
  {
    id: "slot_004",
    slotNumber: "4",
    isAvailable: true,
    estimatedWaitTime: 2,
    location: {
      latitude: 40.7614,
      longitude: -73.9776,
      address: "321 Park Ave, New York, NY 10010",
      city: "New York",
      zipCode: "10010",
    },
  },
];

export const getAvailableDriveThruSlotsTool = tool(
  async (args: {
    location?: { latitude: number; longitude: number };
    maxWaitTime?: number;
  }): Promise<string> => {
    try {
      let availableSlots = driveThruSlots.filter((slot) => slot.isAvailable);

      // Filter by maximum wait time
      if (args.maxWaitTime) {
        availableSlots = availableSlots.filter(
          (slot) => slot.estimatedWaitTime <= args.maxWaitTime!
        );
      }

      // Sort by wait time (shortest first)
      availableSlots.sort((a, b) => a.estimatedWaitTime - b.estimatedWaitTime);

      return JSON.stringify({
        success: true,
        availableSlots: availableSlots,
        totalCount: availableSlots.length,
        message: "Available drive-thru slots retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get available drive-thru slots",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_available_drive_thru_slots",
    description: "Get available drive-thru slots with wait times and locations",
    schema: z.object({
      location: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional()
        .describe("User location for proximity filtering"),
      maxWaitTime: z
        .number()
        .optional()
        .describe("Maximum acceptable wait time in minutes"),
    }),
  }
);

export const reserveDriveThruSlotTool = tool(
  async (args: {
    slotId: string;
    customerId: string;
    estimatedArrival: string;
  }): Promise<string> => {
    try {
      const { slotId, customerId, estimatedArrival } = args;
      const slot = driveThruSlots.find((s) => s.id === slotId);

      if (!slot) {
        return JSON.stringify({
          error: "Drive-thru slot not found",
          slotId: slotId,
        });
      }

      if (!slot.isAvailable) {
        return JSON.stringify({
          error: "Drive-thru slot is not available",
          slotId: slotId,
          currentStatus: "occupied",
        });
      }

      // Reserve the slot
      slot.isAvailable = false;

      const reservation = {
        slotId: slotId,
        slotNumber: slot.slotNumber,
        customerId: customerId,
        estimatedArrival: estimatedArrival,
        reservedAt: new Date().toISOString(),
        estimatedWaitTime: slot.estimatedWaitTime,
        location: slot.location,
        status: "reserved",
      };

      return JSON.stringify({
        success: true,
        reservation: reservation,
        message: `Drive-thru slot ${slot.slotNumber} reserved successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to reserve drive-thru slot",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "reserve_drive_thru_slot",
    description: "Reserve a specific drive-thru slot for customer pickup",
    schema: z.object({
      slotId: z.string().describe("Drive-thru slot ID to reserve"),
      customerId: z.string().describe("Customer ID making the reservation"),
      estimatedArrival: z
        .string()
        .describe("Estimated arrival time (ISO format)"),
    }),
  }
);

export const releaseDriveThruSlotTool = tool(
  async (args: { slotId: string }): Promise<string> => {
    try {
      const { slotId } = args;
      const slot = driveThruSlots.find((s) => s.id === slotId);

      if (!slot) {
        return JSON.stringify({
          error: "Drive-thru slot not found",
          slotId: slotId,
        });
      }

      // Release the slot
      slot.isAvailable = true;

      return JSON.stringify({
        success: true,
        slotId: slotId,
        slotNumber: slot.slotNumber,
        message: `Drive-thru slot ${slot.slotNumber} released successfully`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to release drive-thru slot",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "release_drive_thru_slot",
    description: "Release a drive-thru slot to make it available again",
    schema: z.object({
      slotId: z.string().describe("Drive-thru slot ID to release"),
    }),
  }
);

export const updateDriveThruWaitTimeTool = tool(
  async (args: { slotId: string; newWaitTime: number }): Promise<string> => {
    try {
      const { slotId, newWaitTime } = args;
      const slot = driveThruSlots.find((s) => s.id === slotId);

      if (!slot) {
        return JSON.stringify({
          error: "Drive-thru slot not found",
          slotId: slotId,
        });
      }

      if (newWaitTime < 0) {
        return JSON.stringify({
          error: "Wait time cannot be negative",
          newWaitTime: newWaitTime,
        });
      }

      // Update wait time
      slot.estimatedWaitTime = newWaitTime;

      return JSON.stringify({
        success: true,
        slotId: slotId,
        slotNumber: slot.slotNumber,
        newWaitTime: newWaitTime,
        message: `Drive-thru slot ${slot.slotNumber} wait time updated to ${newWaitTime} minutes`,
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to update drive-thru wait time",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "update_drive_thru_wait_time",
    description:
      "Update the estimated wait time for a specific drive-thru slot",
    schema: z.object({
      slotId: z.string().describe("Drive-thru slot ID to update"),
      newWaitTime: z.number().describe("New estimated wait time in minutes"),
    }),
  }
);

export const getDriveThruStatusTool = tool(
  async (): Promise<string> => {
    try {
      const totalSlots = driveThruSlots.length;
      const availableSlots = driveThruSlots.filter(
        (slot) => slot.isAvailable
      ).length;
      const occupiedSlots = totalSlots - availableSlots;
      const averageWaitTime =
        driveThruSlots.reduce((sum, slot) => sum + slot.estimatedWaitTime, 0) /
        totalSlots;

      return JSON.stringify({
        success: true,
        status: {
          totalSlots: totalSlots,
          availableSlots: availableSlots,
          occupiedSlots: occupiedSlots,
          averageWaitTime: Math.round(averageWaitTime * 10) / 10,
          slots: driveThruSlots,
        },
        message: "Drive-thru status retrieved successfully",
      });
    } catch (error) {
      return JSON.stringify({
        error: "Failed to get drive-thru status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "get_drive_thru_status",
    description:
      "Get overall drive-thru status including availability and wait times",
    schema: z.object({}),
  }
);
