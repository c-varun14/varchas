import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/app/utils/VerifyAdmin";

const formatError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ eventId: string }>;
  }
) {
  try {
    const { eventId } = await params;

    const winners = await prisma.culturalWinners.findMany({
      where: { eventId },
      orderBy: [{ position: "asc" }],
    });

    return NextResponse.json(winners);
  } catch (error) {
    console.error("Error fetching cultural winners:", error);
    return formatError("Failed to fetch cultural winners", 500);
  }
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ eventId: string }>;
  }
) {
  try {
    const isAuthorized = await verifyAdmin("cultural");
    if (!isAuthorized) {
      return formatError("Unauthorized", 401);
    }

    const { eventId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const positionRaw = body["position"];
    const departmentName = body.departmentName;
    const pointsRaw = body["points"];

    if (typeof positionRaw !== "number" || positionRaw <= 0) {
      return formatError("Position must be a positive number");
    }

    if (typeof pointsRaw !== "number" || pointsRaw < 0) {
      return formatError("Points must be a non-negative number");
    }

    if (typeof departmentName !== "string") {
      return formatError("Department must be provided");
    }

    const winner = await prisma.culturalWinners.create({
      data: {
        eventId,
        position: positionRaw,
        departmentName,
        points: pointsRaw,
      },
    });

    return NextResponse.json(winner, { status: 201 });
  } catch (error) {
    console.error("Error saving cultural winner:", error);
    return formatError("Failed to save cultural winner", 500);
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ eventId: string }>;
  }
) {
  try {
    const isAuthorized = await verifyAdmin("cultural");
    if (!isAuthorized) {
      return formatError("Unauthorized", 401);
    }

    const { eventId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const idRaw = body.id;

    if (typeof idRaw !== "string" || !idRaw.trim()) {
      return formatError("id must be a string");
    }

    const id = idRaw.trim();

    const updateData: Partial<{
      position: number;
      departmentName: string;
      points: number;
    }> = {};

    if (Object.prototype.hasOwnProperty.call(body, "position")) {
      const positionRaw = body["position"];

      if (typeof positionRaw !== "number" || positionRaw <= 0) {
        return formatError("Position must be a positive number");
      }
      updateData.position = positionRaw;
    }

    if (Object.prototype.hasOwnProperty.call(body, "departmentName")) {
      const departmentName = body.departmentName;
      if (typeof departmentName !== "string") {
        return formatError("Department must be provided");
      }
      updateData.departmentName = departmentName;
    }

    if (Object.prototype.hasOwnProperty.call(body, "points")) {
      const pointsRaw = body["points"];
      if (typeof pointsRaw !== "number" || pointsRaw < 0) {
        return formatError("Points must be a non-negative number");
      }
      updateData.points = pointsRaw;
    }

    if (Object.keys(updateData).length === 0) {
      return formatError("No valid fields provided for update");
    }

    const updated = await prisma.culturalWinners.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating cultural winner:", error);
    return formatError("Failed to update cultural winner", 500);
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ eventId: string }>;
  }
) {
  try {
    const isAuthorized = await verifyAdmin("cultural");
    if (!isAuthorized) {
      return formatError("Unauthorized", 401);
    }

    const { eventId } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const idRaw = body.id;

    if (typeof idRaw !== "string" || !idRaw.trim()) {
      return formatError("id must be a string");
    }

    const id = idRaw.trim();

    const existing = await prisma.culturalWinners.findUnique({ where: { id } });

    if (!existing || existing.eventId !== eventId) {
      return formatError("Cultural winner not found", 404);
    }

    await prisma.culturalWinners.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cultural winner:", error);
    return formatError("Failed to delete cultural winner", 500);
  }
}
