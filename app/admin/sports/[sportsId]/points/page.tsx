import Link from "next/link";
import prisma from "@/lib/prisma";
import { type DepartmentScore } from "@/components/sports/PointsTable";
import { Button } from "@/components/ui/button";
import EditPoints from "@/components/sports/EditPoints";

type SportScoresPageProps = {
  params: Promise<{
    sportsId: string;
  }>;
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getScores(sportsId: string): Promise<DepartmentScore[]> {
  const scores = await prisma.score.findMany({
    where: {
      event_id: sportsId,
    },
    orderBy: [{ points: "desc" }, { wins: "desc" }, { createdAt: "asc" }],
  });

  return scores as DepartmentScore[];
}

export default async function SportScoresPage({
  params,
}: SportScoresPageProps) {
  const { sportsId } = await params;
  const scores = await getScores(sportsId);
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button asChild variant="outline" className="mb-2">
        <Link href="/admin/sports">← Back to Sports</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Points table admin</h1>
        <p className="text-sm text-muted-foreground">
          Scores are fetched server-side and can be updated below.
        </p>
      </div>

      <EditPoints sportsId={sportsId} initialScores={scores} />
    </div>
  );
}
