import HeroSection from "@/components/home/HeroSection";
import LeadershipTable, {
  type LeadershipEntry,
} from "@/components/LeadershipTable";
import prisma from "@/lib/prisma";

export default async function Home() {
  const departments = await prisma.department.findMany({
    include: {
      culturalWinners: true,
      scores: true,
    },
  });

  const sportsStandings: LeadershipEntry[] = departments.map((department) => ({
    department: department.name,
    points: department.scores.reduce((total, score) => total + score.points, 0),
    wins: department.scores.reduce((total, score) => total + score.wins, 0),
  }));

  const culturalStandings: LeadershipEntry[] = departments.map(
    (department) => ({
      department: department.name,
      points: department.culturalWinners.reduce(
        (total, winner) => total + winner.points,
        0
      ),
      wins: department.culturalWinners.reduce(
        (total, winner) => total + (winner.position === 1 ? 1 : 0),
        0
      ),
    })
  );

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

        <LeadershipTable
          sports={sportsStandings}
          cultural={culturalStandings}
        />
      </section>
    </>
  );
}
