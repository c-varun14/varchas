import prisma from "@/lib/prisma";
import PointsTable, {
  type DepartmentScore,
} from "@/components/sports/PointsTable";
import FixturesList from "@/components/sports/FixturesList";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  User,
  ArrowLeft,
  Calendar,
  Trophy as CupIcon,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type FixtureDTO = {
  id: string;
  department_1: string;
  department_2: string;
  start_time: string;
  end_time: string;
  score: string;
};

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

async function getFixtures(sportsId: string): Promise<FixtureDTO[]> {
  const fixtures = await prisma.fixture.findMany({
    where: { event_id: sportsId },
    orderBy: { start_time: "asc" },
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
  const [sport, scores, fixtures] = await Promise.all([
    getSportDetails(sportsId),
    getScores(sportsId),
    getFixtures(sportsId),
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
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <Link
          href="/sports"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to all sports
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {formatSportName(sport.name)}
              <Badge
                variant={sport.gender === "MALE" ? "default" : "secondary"}
                className="ml-2 sm:ml-3 align-middle"
              >
                {sport.gender}
              </Badge>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Current standings and statistics
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 bg-muted/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
            {sport.solo ? (
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            ) : (
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            )}
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
              {sport.solo ? "Individual" : "Team"} Event
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm overflow-hidden">
        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto overflow-x-auto">
            <TabsTrigger
              value="standings"
              className="relative h-12 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none whitespace-nowrap"
            >
              <Trophy className="inline-block mr-2 h-4 w-4" />
              Standings
            </TabsTrigger>
            <TabsTrigger
              value="fixtures"
              className="relative h-12 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none whitespace-nowrap"
            >
              <Calendar className="inline-block mr-2 h-4 w-4" />
              <span className="inline-flex items-center">
                Fixtures & Results
                {fixtures.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {fixtures.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standings" className="m-0 p-4 sm:p-6">
            <PointsTable scores={scores} />
          </TabsContent>

          <TabsContent value="fixtures" className="m-0 p-4 sm:p-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                {sport.name} {sport.gender === "MALE" ? "Men's" : "Women's"}{" "}
                Fixtures
              </h2>
              <FixturesList fixtures={fixtures} sportName={sport.name} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
