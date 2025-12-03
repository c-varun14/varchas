import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, ArrowLeft, Users, Award } from "lucide-react";

import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600;
// export const dynamic = "force-dynamic";

type CulturalWinnerRow = {
  id: string;
  position: number;
  departmentName: string;
  points: number;
};

type CulturalEventDetails = {
  id: string;
  name: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  venue: string;
  solo: boolean;
  winners: CulturalWinnerRow[];
};

type CulturalEventPageProps = {
  params: Promise<{ eventId: string }>;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDepartmentName(value: string) {
  return value.replace(/_/g, "-");
}

async function getEventDetails(eventId: string): Promise<CulturalEventDetails> {
  const event = await prisma.culturalEvent.findUnique({
    where: { id: eventId },
    include: {
      winners: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    solo: event.solo,
    winners: event.winners.map((winner) => ({
      id: winner.id,
      position: winner.position,
      departmentName: winner.departmentName,
      points: winner.points,
    })),
  };
}

export default async function CulturalEventPage({
  params,
}: CulturalEventPageProps) {
  const { eventId } = await params;
  const event = await getEventDetails(eventId);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/cultural"
        className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to cultural events
      </Link>

      <div className="mt-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {event.name}
            </h1>
            {event.description && (
              <p className="max-w-2xl text-muted-foreground">
                {event.description}
              </p>
            )}
          </div>
          <Badge variant={event.solo ? "secondary" : "outline"}>
            {event.solo ? "Solo" : "Team"} Event
          </Badge>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <dt className="text-xs uppercase text-muted-foreground">
                Schedule
              </dt>
              <dd className="text-sm font-medium">
                {formatDateTime(event.startTime)} –{" "}
                {formatDateTime(event.endTime)}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Venue</dt>
              <dd className="text-sm font-medium">{event.venue}</dd>
            </div>
          </div>
        </dl>
      </div>

      <section className="mt-10 rounded-3xl border border-border bg-background/60 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Podium placements</h2>
            <p className="text-sm text-muted-foreground">
              Departments that have secured a place for this event.
            </p>
          </div>
        </div>

        {event.winners.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Winners will appear here once results are published.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {event.winners.map((winner) => (
              <div
                key={winner.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition hover:border-primary/60"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    #{winner.position}
                  </span>
                  <div>
                    <div className="text-base font-semibold">
                      {formatDepartmentName(winner.departmentName)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {winner.points} point{winner.points === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
