import HeroSection from "@/components/home/HeroSection";
import PointsTable, {
  type DepartmentScore,
} from "@/components/sports/PointsTable";
import prisma from "@/lib/prisma";
import { DEPARTMENTNAME } from "@/app/generated/prisma/enums";

type AdditionalDataPayload = {
  name: string | null;
  value: number;
};

const DEPARTMENT_IDS = Object.values(
  DEPARTMENTNAME
) as DepartmentScore["department_id"][];

const parseAdditionalData = (payload: unknown): AdditionalDataPayload => {
  if (!payload || typeof payload !== "object") {
    return { name: null, value: 0 };
  }

  const record = payload as Record<string, unknown>;
  const name =
    typeof record.name === "string" && record.name.trim().length > 0
      ? record.name
      : null;
  const rawValue = record.value;
  const value =
    typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : 0;

  return { name, value };
};

async function getAggregatedDepartmentScores(): Promise<DepartmentScore[]> {
  const rawScores = await prisma.score.findMany({
    select: {
      id: true,
      department_id: true,
      wins: true,
      losses: true,
      draws: true,
      points: true,
    },
  });

  const aggregated = new Map<
    DepartmentScore["department_id"],
    DepartmentScore
  >();

  DEPARTMENT_IDS.forEach((departmentId) => {
    aggregated.set(departmentId, {
      id: departmentId,
      department_id: departmentId,
      wins: 0,
      losses: 0,
      draws: 0,
      matches: 0,
      points: 0,
    });
  });

  rawScores.forEach((score) => {
    const aggregate = aggregated.get(score.department_id);
    if (!aggregate) return;

    aggregate.wins += score.wins;
    aggregate.losses += score.losses;
    aggregate.draws += score.draws;
    aggregate.matches = aggregate.wins + aggregate.losses + aggregate.draws;
    aggregate.points += score.points;
  });

  return Array.from(aggregated.values());
}

export default async function Home() {
  const aggregatedScores = await getAggregatedDepartmentScores();

  return (
    <>
      <HeroSection />

      <section className="rounded-3xl bg-white/70 p-6 shadow-xl shadow-indigo-200/40 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Overall Standings
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              Department Points Table
            </h2>
          </div>
        </div>
        <PointsTable scores={aggregatedScores} />
      </section>
    </>
  );
}
