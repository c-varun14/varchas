import prisma from "@/lib/prisma";
import PointsTable, {
  type DepartmentScore,
} from "@/components/sports/PointsTable";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type SportDetails = {
  id: string;
  name: string;
  gender: string;
  solo: boolean;
  additional_data_name: string;
};

type SportScoresPageProps = {
  params: Promise<{ sportsId: string }>;
};

async function getSportDetails(sportsId: string): Promise<SportDetails | null> {
  const sport = await prisma.sport_event.findUnique({
    where: { id: sportsId },
  });
  return sport as unknown as SportDetails | null;
}

async function getScores(sportsId: string): Promise<DepartmentScore[]> {
  const scores = await prisma.score.findMany({
    where: { event_id: sportsId },
    orderBy: [
      { points: "desc" },
      { wins: "desc" },
      { losses: "asc" },
      { department_id: "asc" },
    ],
  });
  return scores as unknown as DepartmentScore[];
}

function formatSportName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function SportPointsPage({
  params,
}: SportScoresPageProps) {
  const { sportsId } = await params;
  const [sport, scores] = await Promise.all([
    getSportDetails(sportsId),
    getScores(sportsId),
  ]);

  if (!sport) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="max-w-md mx-auto py-12">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sport Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested sport could not be found.
          </p>
          <Link
            href="/sports"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Sports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="mb-6">
        <Link
          href="/sports"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to all sports
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {formatSportName(sport.name)}
              <Badge
                variant={sport.gender === "MALE" ? "default" : "secondary"}
                className="ml-3 align-middle"
              >
                {sport.gender}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Current standings and statistics
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
            {sport.solo ? (
              <User className="h-5 w-5 text-amber-500" />
            ) : (
              <Users className="h-5 w-5 text-blue-500" />
            )}
            <span className="text-sm font-medium">
              {sport.solo ? "Individual" : "Team"} Event
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm overflow-hidden">
        <PointsTable scores={scores} />
      </div>
    </div>
  );
}
