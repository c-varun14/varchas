import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/utils/VerifyAdmin";

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
    const sports = await prisma.sport_event.findMany({
      orderBy: [{ name: "asc" }],
    });

    return NextResponse.json(sports);
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json(
      { error: "Failed to fetch sports" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAdmin("sports");
    if (!isAuthorized)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const gender = typeof body.gender === "string" ? body.gender : "";
    const venue = typeof body.venue === "string" ? body.venue.trim() : "";
    const solo = Boolean(body?.solo);

    const start = parseDate(body.startTime);
    const end = parseDate(body.endTime);

    if (!name || !gender || !venue || !start || !end) {
      return formatError(
        "Name, gender, venue, start time and end time are required for sports events"
      );
    }

    if (start >= end) {
      return formatError("Start time must be before end time");
    }

    const sport = await prisma.sport_event.create({
      data: {
        name,
        gender,
        solo,
        startTime: start,
        endTime: end,
      },
    });

    // Create points entries for all departments
    const departments = await prisma.department.findMany();

    const result = await Promise.all(
      departments.map((dept: { name: string }) =>
        prisma.score.create({
          data: {
            event_id: sport.id,
            department_id: dept.name,
            matches: 0,
            wins: 0,
            losses: 0,
            points: 0,
          },
        })
      )
    );

    return NextResponse.json(sport, { status: 201 });
  } catch (error) {
    console.error("Error creating sport:", error);
    return NextResponse.json(
      { error: "Failed to create sport" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const isAuthorized = await verifyAdmin("sports");
    if (!isAuthorized) {
      return formatError("Unauthorized", 401);
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return formatError("Sport id is required for updates");
    }

    const existing = await prisma.sport_event.findUnique({ where: { id } });
    if (!existing) {
      return formatError("Sport not found", 404);
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : existing.name;
    const gender =
      typeof body.gender === "string" ? body.gender : existing.gender;
    const solo = typeof body.solo === "boolean" ? body.solo : existing.solo;

    const start = body.startTime
      ? parseDate(body.startTime)
      : existing.startTime;
    const end = body.endTime ? parseDate(body.endTime) : existing.endTime;

    if (!start || !end) {
      return formatError("Invalid start or end time");
    }

    if (start >= end) {
      return formatError("Start time must be before end time");
    }

    const updated = await prisma.sport_event.update({
      where: { id },
      data: {
        name,
        gender,
        solo,
        startTime: start,
        endTime: end,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating sport:", error);
    return formatError("Failed to update sport", 500);
  }
}
