import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEPARTMENTNAME } from "@/app/generated/prisma/client";
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
    const additional_data_name =
      typeof body?.additional_data_name === "string"
        ? body.additional_data_name.trim()
        : "";
    const solo = Boolean(body?.solo);

    if (!body.name || !gender || !additional_data_name) {
      return NextResponse.json(
        { error: "Name, gender and deciding factor are required" },
        { status: 400 }
      );
    }

    const sport = await prisma.sport_event.create({
      data: {
        name: body.name,
        gender: gender,
        additional_data_name,
        solo,
      },
    });

    // Create points entries for all departments
    const departments = await prisma.department.findMany();

    console.log(departments);

    const result = await Promise.all(
      departments.map((dept: { name: DEPARTMENTNAME }) =>
        prisma.score.create({
          data: {
            event_id: sport.id,
            department_id: dept.name,
            matches: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            additional_data: {
              name: additional_data_name,
              value: 0,
            },
          },
        })
      )
    );

    console.log(result);

    return NextResponse.json(sport, { status: 201 });
  } catch (error) {
    console.error("Error creating sport:", error);
    return NextResponse.json(
      { error: "Failed to create sport" },
      { status: 500 }
    );
  }
}
