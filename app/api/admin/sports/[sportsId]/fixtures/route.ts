import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { verifyAdmin } from "@/app/utils/VerifyAdmin";

const fixtureDelegate = prisma.fixture as Prisma.fixtureDelegate;

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ sportsId: string }>;
  }
) {
  try {
    const { sportsId } = await params;

    const fixtures = await fixtureDelegate.findMany({
      where: { event_id: sportsId },
      orderBy: [{ start_time: "asc" }],
    });

    return NextResponse.json(fixtures);
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return formatError("Failed to fetch fixtures", 500);
  }
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ sportsId: string }>;
  }
) {
  try {
    const isAuthorized = await verifyAdmin("sports");
    if (!isAuthorized)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { sportsId } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const department_1 = String(body["department_1"]);
    const department_2 = String(body["department_2"]);
    const start_time_raw = body["start_time"];
    const end_time_raw = body["end_time"];
    const score_raw = body["score"];

    if (!(department_1 && department_2)) {
      return formatError("A valid department must be provided");
    }

    const start_time = parseDate(start_time_raw);
    if (!start_time) {
      return formatError("A valid start_time must be provided");
    }

    const end_time = parseDate(end_time_raw);
    if (!end_time) {
      return formatError("A valid end_time must be provided");
    }

    if (start_time >= end_time) {
      return formatError("start_time must be before end_time");
    }

    const score = typeof score_raw === "string" ? score_raw.trim() : "";

    const fixture = await fixtureDelegate.create({
      data: {
        event_id: sportsId,
        department_1,
        department_2,
        start_time,
        end_time,
        score,
      },
    });

    return NextResponse.json(fixture, { status: 201 });
  } catch (error) {
    console.error("Error creating fixture:", error);
    if (error instanceof Error && error.message.includes("Departments must")) {
      return formatError(error.message);
    }
    return formatError("Failed to create fixture", 500);
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ sportsId: string }>;
  }
) {
  try {
    const { sportsId } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const id = typeof body["id"] === "string" ? body["id"] : null;
    if (!id) {
      return formatError("Fixture id is required for updates");
    }

    const existing = await fixtureDelegate.findUnique({ where: { id } });
    if (!existing || existing.event_id !== sportsId) {
      return formatError("Fixture not found", 404);
    }

    const updateData: Record<string, unknown> = {};

    if (body["department_1"] !== undefined) {
      updateData.department_1 = body["department_1"];
    }

    if (body["department_2"] !== undefined) {
      updateData.department_2 = body["department_2"];
    }

    if (
      updateData.department_1 &&
      updateData.department_2 &&
      updateData.department_1 === updateData.department_2
    ) {
      return formatError("Departments must be different");
    }

    if (body["start_time"] !== undefined) {
      const start_time = parseDate(body["start_time"]);
      if (!start_time) {
        return formatError("start_time must be a valid date");
      }
      updateData.start_time = start_time;
    }

    if (body["end_time"] !== undefined) {
      const end_time = parseDate(body["end_time"]);
      if (!end_time) {
        return formatError("end_time must be a valid date");
      }
      updateData.end_time = end_time;
    }

    if (
      updateData.start_time instanceof Date &&
      updateData.end_time instanceof Date &&
      updateData.start_time >= updateData.end_time
    ) {
      return formatError("start_time must be before end_time");
    }

    if (body["score"] !== undefined) {
      updateData.score =
        typeof body["score"] === "string" ? body["score"].trim() : "";
    }

    const updated = await fixtureDelegate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating fixture:", error);
    return formatError("Failed to update fixture", 500);
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ sportsId: string }>;
  }
) {
  try {
    const { sportsId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const id = typeof body["id"] === "string" ? body["id"] : null;

    if (!id) {
      return formatError("Fixture id is required for deletion");
    }

    const existing = await fixtureDelegate.findUnique({ where: { id } });
    if (!existing || existing.event_id !== sportsId) {
      return formatError("Fixture not found", 404);
    }

    await fixtureDelegate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fixture:", error);
    return formatError("Failed to delete fixture", 500);
  }
}
