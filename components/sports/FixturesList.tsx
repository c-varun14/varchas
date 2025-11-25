"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
} from "lucide-react";
import {
  FixtureDTO,
  getFixtureStatus,
  type FixtureStatus,
} from "@/types/sports";
import { useEffect, useState } from "react";

type FixturesListProps = {
  fixtures: FixtureDTO[];
  sportName: string;
};

export default function FixturesList({
  fixtures,
  sportName,
}: FixturesListProps) {
  const [currentTime, setCurrentTime] = useState<number>(() =>
    new Date().getTime()
  );

  // Update current time every minute to handle status changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: FixtureStatus) => {
    const statusMap = {
      pending: {
        label: "Upcoming",
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
      },
      happening: {
        label: "Live",
        className:
          "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200 animate-pulse",
      },
      completed: {
        label: "Completed",
        className:
          "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-200",
      },
    } as const;

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;

    return (
      <Badge
        variant="outline"
        className={cn("text-xs font-medium", statusInfo.className)}
      >
        {statusInfo.label}
      </Badge>
    );
  };

  if (fixtures.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-1">No Fixtures Scheduled</h3>
        <p className="text-muted-foreground text-sm">
          Check back later for upcoming {sportName.toLowerCase()} matches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {fixtures.map((fixture) => {
        const status = getFixtureStatus(fixture);
        const matchDate = formatMatchTime(fixture.start_time);
        const startTime = formatTimeOnly(fixture.start_time);
        const endTime = formatTimeOnly(fixture.end_time);

        return (
          <div
            key={fixture.id}
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card active:scale-[0.99]"
          >
            <div className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    {matchDate}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ClockIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">
                      {startTime} - {endTime}
                    </span>
                  </div>
                </div>
                <div className="sm:ml-4">{getStatusBadge(status)}</div>
              </div>

              <div className="flex items-center py-2 sm:py-3 w-full">
                <div
                  className="flex-1 min-w-0 text-right font-medium pr-2 truncate"
                  title={fixture.department_1}
                >
                  {fixture.department_1}
                </div>

                <div className="mx-2 shrink-0">
                  {status === "completed" && fixture.score ? (
                    <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm whitespace-nowrap">
                      {fixture.score}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      vs
                    </span>
                  )}
                </div>

                <div
                  className="flex-1 min-w-0 font-medium pl-2 truncate text-left"
                  title={fixture.department_2}
                >
                  {fixture.department_2}
                </div>
              </div>

              {status === "happening" && (
                <div className="mt-2 pt-2 border-t border-dashed flex items-center text-xs text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                  <span>Match in progress</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
