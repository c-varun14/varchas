"use client";

import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type DEPARTMENTNAME } from "@/app/generated/prisma/enums";

export type LeadershipEntry = {
  department: DEPARTMENTNAME;
  points: number;
  wins: number;
};

type LeadershipTableProps = {
  sports: LeadershipEntry[];
  cultural: LeadershipEntry[];
};

type StandingsRow = LeadershipEntry & {
  position: number;
};

const VIEW_LABELS: Record<ViewType, string> = {
  sports: "Sports Points",
  cultural: "Cultural Points",
};

type ViewType = "sports" | "cultural";

function computeStandings(entries: LeadershipEntry[]): StandingsRow[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.department.localeCompare(b.department);
  });

  let previousKey: string | null = null;
  let previousPosition = 0;

  return sorted.map((entry, index) => {
    const key = `${entry.points}-${entry.wins}`;
    const position = key === previousKey ? previousPosition : index + 1;

    previousKey = key;
    previousPosition = position;

    return {
      ...entry,
      position,
    };
  });
}

const formatDepartment = (department: DEPARTMENTNAME) =>
  department.replace(/_/g, "-");

export default function LeadershipTable({
  sports,
  cultural,
}: LeadershipTableProps) {
  const [activeView, setActiveView] = useState<ViewType>("sports");

  const standings = useMemo(() => {
    const entries = activeView === "sports" ? sports : cultural;
    return computeStandings(entries);
  }, [activeView, sports, cultural]);

  const activeLabel = VIEW_LABELS[activeView];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Leaderboard
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeLabel} • {standings.length} departments
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={activeView}
          onValueChange={(value) => {
            if (value === "sports" || value === "cultural") {
              setActiveView(value);
            }
          }}
          className="bg-muted/40 rounded-lg p-1.5 shadow-sm"
          aria-label="Select points table view"
        >
          <ToggleGroupItem
            value="sports"
            className="px-6 py-2 text-sm font-medium transition-all data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:shadow-sm"
          >
            🏆 Sports
          </ToggleGroupItem>
          <ToggleGroupItem
            value="cultural"
            className="px-6 py-2 text-sm font-medium transition-all data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:shadow-sm"
          >
            🎭 Cultural
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
        <Table>
          <TableHeader className="bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
            <TableRow className="border-b border-border/30 hover:bg-transparent">
              <TableHead className="w-24 px-6 py-4 font-medium text-muted-foreground">
                Position
              </TableHead>
              <TableHead className="px-6 py-4 font-medium text-muted-foreground">
                Department
              </TableHead>
              <TableHead className="px-6 py-4 text-right font-medium text-muted-foreground">
                Points
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.length > 0 ? (
              standings.map((row, index) => (
                <TableRow
                  key={`${activeView}-${row.department}`}
                  className="transition-colors hover:bg-muted/30"
                >
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        row.position === 1
                          ? "bg-yellow-100 text-yellow-800"
                          : row.position === 2
                          ? "bg-gray-100 text-gray-700"
                          : row.position === 3
                          ? "bg-amber-50 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {row.position}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground">
                        {formatDepartment(row.department)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-lg font-bold text-foreground">
                        {row.points.toLocaleString()}
                      </span>
                      {/* <span className="text-xs text-muted-foreground">
                        ({row.wins} wins)
                      </span> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-muted p-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium">No data available</h3>
                    <p className="text-sm text-muted-foreground">
                      Check back later for updates on the leaderboard.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* <p className="text-center text-xs text-muted-foreground">
        Tie-breakers apply in this order: total points, then total wins. If both
        are equal, departments share the same position.
      </p> */}
    </div>
  );
}
