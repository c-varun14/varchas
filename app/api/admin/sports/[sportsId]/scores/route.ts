import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  DEPARTMENTNAME as DEPARTMENT_VALUES,
  type DEPARTMENTNAME,
} from "@/app/generated/prisma/enums";
import { verifyAdmin } from "@/app/utils/VerifyAdmin";

const DEPARTMENT_IDS = Object.values(DEPARTMENT_VALUES) as DEPARTMENTNAME[];

const isDepartmentName = (value: unknown): value is DEPARTMENTNAME => {
  if (typeof value !== "string") return false;
  return DEPARTMENT_IDS.includes(value as DEPARTMENTNAME);
};

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      sportsId: string;
    }>;
  }
) {
  try {
    const isAuthorized = await verifyAdmin("sports");
    if (!isAuthorized)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { sportsId } = await params;
    const department_id_raw = (body as Record<string, unknown>)[
      "department_id"
    ];
    const department_id = isDepartmentName(department_id_raw)
      ? department_id_raw.replace("-", "_")
      : null;

    if (!department_id) {
      return NextResponse.json(
        { error: "Invalid or missing department_id" },
        { status: 400 }
      );
    }

    const wins = parseNumber((body as Record<string, unknown>)["wins"]);
    const losses = parseNumber((body as Record<string, unknown>)["losses"]);
    const draws = parseNumber((body as Record<string, unknown>)["draws"]);
    const points = parseNumber((body as Record<string, unknown>)["points"]);

    const matches = wins + losses + draws;

    // Upsert the score
    await prisma.score.update({
      where: {
        event_id_department_id: {
          event_id: sportsId,
          //@ts-expect-error The type is correct
          department_id,
        },
      },
      data: {
        wins,
        losses,
        matches,
        points,
      },
    });

    // Return all scores for this sport, ordered for display
    const scores = await prisma.score.findMany({
      where: {
        event_id: sportsId,
      },
      orderBy: [{ points: "desc" }, { wins: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}
