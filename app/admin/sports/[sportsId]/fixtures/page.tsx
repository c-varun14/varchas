import Link from "next/link";
import prisma from "@/lib/prisma";
import ManageFixtures from "@/components/sports/ManageFixtures";
import { Button } from "@/components/ui/button";

type FixturesPageProps = {
  params: Promise<{ sportsId: string }>;
};

export const revalidate = 1800;
// export const dynamic = "force-dynamic";

async function getFixtures(sportsId: string) {
  const fixtures = await prisma.fixture.findMany({
    where: { event_id: sportsId },
    orderBy: [{ end_time: "asc" }],
  });

  return fixtures.map((fixture) => ({
    id: fixture.id,
    department_1: fixture.department_1,
    department_2: fixture.department_2,
    start_time: fixture.start_time.toISOString(),
    end_time: fixture.end_time.toISOString(),
    score: fixture.score,
  }));
}

export default async function FixturesPage({ params }: FixturesPageProps) {
  const { sportsId } = await params;
  const fixtures = await getFixtures(sportsId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button asChild variant="outline" className="mb-2">
        <Link href="/admin/sports">← Back to Sports</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Fixtures admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage department matchups for this sport. All data is fetched
          server-side to avoid stale information.
        </p>
      </div>

      <ManageFixtures sportsId={sportsId} initialFixtures={fixtures} />
    </div>
  );
}
