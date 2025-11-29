import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/app/utils/VerifyAdmin";

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
    const gender = typeof body?.gender === "string" ? body.gender : "";

    const solo = Boolean(body?.solo);

    if (!body.name || !gender) {
      return NextResponse.json(
        { error: "Name, gender and deciding factor are required" },
        { status: 400 }
      );
    }

    const sport = await prisma.sport_event.create({
      data: {
        name: body.name,
        gender: gender,
        solo,
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
