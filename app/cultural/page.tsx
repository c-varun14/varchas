import Link from "next/link";
import { BookOpen, Calendar, MapPin, Users } from "lucide-react";

import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const RULEBOOK_URL =
  "https://drive.google.com/drive/folders/1NAma7ysVg8qdw2o30ZYpcT-eRCkDKFkn?usp=drive_link";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type CulturalEventSummary = {
  id: string;
  name: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  venue: string;
  solo: boolean;
  _count: {
    winners: number;
  };
};

export default async function CulturalEventsPage() {
  const events = (await prisma.culturalEvent.findMany({
    orderBy: { startTime: "asc" },
    include: {
      _count: {
        select: {
          winners: true,
        },
      },
    },
  })) as CulturalEventSummary[];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Cultural Events
          </h1>
          <p className="text-muted-foreground">
            Explore the complete line-up of cultural performances and stay
            updated on results as departments compete for the podium.
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

      {events.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/20 px-8 py-16 text-center">
          <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold">
            Cultural schedule coming soon
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The events list will appear here once the schedule is published.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/cultural/${event.id}`}
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-primary">
                    {event.name}
                  </h2>
                  {event.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
                <Badge variant={event.solo ? "secondary" : "outline"}>
                  {event.solo ? "Solo" : "Team"}
                </Badge>
              </div>

              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDateTime(event.startTime)} –{" "}
                    {formatDateTime(event.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {event._count.winners} winner
                    {event._count.winners === 1 ? "" : "s"} recorded
                  </span>
                </div>
              </div>

              <div className="mt-6 text-sm font-semibold text-primary">
                View event details →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
