import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/app/utils/VerifyAdmin";

const formatError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export async function GET() {
  try {
    const events = await prisma.culturalEvent.findMany({
      orderBy: [{ startTime: "asc" }],
      include: {
        _count: {
          select: {
            winners: true,
          },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching cultural events:", error);
    return formatError("Failed to fetch cultural events", 500);
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAdmin("cultural");
    if (!isAuthorized) {
      return formatError("Unauthorized", 401);
    }

    const body = (await request.json()) as Record<string, unknown>;

    const name = typeof body["name"] === "string" ? body["name"].trim() : "";
    const venue = typeof body["venue"] === "string" ? body["venue"].trim() : "";
    const description =
      typeof body["description"] === "string"
        ? body["description"].trim() || null
        : null;

    const start = parseDate(body["starttime"] ?? body["startTime"]);
    const end = parseDate(body["endtime"] ?? body["endTime"]);
    const solo = Boolean(body?.solo);

    if (!name || !venue || !start || !end) {
      return formatError(
        "Name, venue, start time and end time are required for cultural events"
      );
    }

    if (start >= end) {
      return formatError("Start time must be before end time");
    }

    const event = await prisma.culturalEvent.create({
      data: {
        name,
        venue,
        description,
        startTime: start,
        endTime: end,
        solo,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating cultural event:", error);
    return formatError("Failed to create cultural event", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const isAuthorized = await verifyAdmin("cultural");
    if (!isAuthorized) {
      return formatError("Unauthorized", 401);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const id = typeof body["id"] === "string" ? body["id"].trim() : "";

    if (!id) {
      return formatError("Event id is required for updates");
    }

    const existing = await prisma.culturalEvent.findUnique({ where: { id } });
    if (!existing) {
      return formatError("Cultural event not found", 404);
    }

    const updateData: Record<string, unknown> = {};

    if (typeof body["name"] === "string") {
      const name = body["name"].trim();
      if (!name) {
        return formatError("Event name cannot be empty");
      }
      updateData.name = name;
    }

    if (typeof body["venue"] === "string") {
      const venue = body["venue"].trim();
      if (!venue) {
        return formatError("Venue cannot be empty");
      }
      updateData.venue = venue;
    }

    if (body["description"] !== undefined) {
      if (typeof body["description"] === "string") {
        updateData.description = body["description"].trim() || null;
      } else if (body["description"] === null) {
        updateData.description = null;
      }
    }

    const startRaw = body["startTime"] ?? body["starttime"];
    const endRaw = body["endTime"] ?? body["endtime"];

    let startTime: Date | undefined;
    let endTime: Date | undefined;

    if (startRaw !== undefined) {
      const parsed = parseDate(startRaw);
      if (!parsed) {
        return formatError("startTime must be a valid date");
      }
      startTime = parsed;
      updateData.startTime = parsed;
    }

    if (endRaw !== undefined) {
      const parsed = parseDate(endRaw);
      if (!parsed) {
        return formatError("endTime must be a valid date");
      }
      endTime = parsed;
      updateData.endTime = parsed;
    }

    const startToCompare = startTime ?? existing.startTime;
    const endToCompare = endTime ?? existing.endTime;

    if (startToCompare >= endToCompare) {
      return formatError("Start time must be before end time");
    }

    if (typeof body["solo"] === "boolean") {
      updateData.solo = body["solo"];
    }

    if (Object.keys(updateData).length === 0) {
      return formatError("No valid fields provided for update");
    }

    const updated = await prisma.culturalEvent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating cultural event:", error);
    return formatError("Failed to update cultural event", 500);
  }
}
