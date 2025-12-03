import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Calendar } from "lucide-react";

export const revalidate = 3600;
// export const dynamic = "force-dynamic";

const RULEBOOK_URL =
  "https://drive.google.com/drive/folders/1NAma7ysVg8qdw2o30ZYpcT-eRCkDKFkn?usp=drive_link";

function formatDateTime(date: Date) {
  // Format the Date object directly as IST time
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC", // enforce UTC timezone
  }).format(date);
}

type SportEvent = {
  id: string;
  name: string;
  gender: string;
  additional_data_name: string;
  solo: boolean;
  startTime: Date;
  endTime: Date;
  venue: string;
};

function formatSportName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function getSports(): Promise<SportEvent[]> {
  const sports = await prisma.sport_event.findMany({
    orderBy: [{ startTime: "asc" }],
  });
  return sports as unknown as SportEvent[];
}

export default async function SportsPage() {
  const sports = await getSports();

  console.log(sports[0].startTime);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="flex flex-col gap-6 border-b mb-10 border-border pb-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sports Events
          </h1>
          <p className="text-muted-foreground">
            Select a sport to view the current standings and points table
          </p>
        </div>
        <Link
          href={RULEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-full border bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <BookOpen className="h-4 w-4" />
          View rulebook
        </Link>
      </div>

      {/* <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Sports Events
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          
        </p>
      </div> */}

      {sports.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No sports events available
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later for upcoming events
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => (
            <Link key={sport.id} href={`/sports/${sport.id}`} className="group">
              <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {formatSportName(sport.name)}
                    </CardTitle>
                    <Badge
                      variant={
                        sport.gender === "MALE" ? "default" : "secondary"
                      }
                      className="shrink-0"
                    >
                      {sport.gender}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          sport.solo ? "bg-amber-500" : "bg-blue-500"
                        }`}
                      />
                      {sport.solo ? "Individual Event" : "Team Event"}
                    </div>
                    {sport.startTime && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="text-sm text-muted-foreground">
                          <div>{formatDateTime(sport.startTime)}</div>
                          <div className="text-xs text-muted-foreground">
                            to
                          </div>
                          <div>{formatDateTime(sport.endTime)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full flex items-center justify-between text-sm text-muted-foreground">
                    <span>View Standings</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
