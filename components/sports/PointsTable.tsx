"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type DEPARTMENTNAME } from "@/app/generated/prisma/enums";

type DepartmentId = DEPARTMENTNAME;

export type DepartmentScore = {
  id?: string;
  department_id: DepartmentId;
  wins: number;
  losses: number;
  draws: number;
  matches: number;
  points: number;
};

const PointsTable = ({ scores }: { scores: DepartmentScore[] }) => {
  const sortedScores = [...scores].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    // if (b.wins !== a.wins)
    return b.wins - a.wins;
  });
  const rankedScores = sortedScores.reduce<
    { score: DepartmentScore; position: number; tieBreakKey: string }[]
  >((acc, score, index) => {
    const tieBreakKey = `${score.points}-${score.wins}-${score.losses}`;
    const prev = acc[index - 1];
    const position =
      prev && prev.tieBreakKey === tieBreakKey ? prev.position : index + 1;

    acc.push({ score, position, tieBreakKey });
    return acc;
  }, []);

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden"
      id="leaderboard"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Matches</TableHead>
            <TableHead className="text-right">Wins</TableHead>
            <TableHead className="text-right">Losses</TableHead>
            <TableHead className="text-right">Draws</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankedScores.length > 0 ? (
            rankedScores.map(({ score, position }) => (
              <TableRow key={score.id ?? score.department_id}>
                <TableCell className="font-medium">{position}</TableCell>
                <TableCell className="font-medium">
                  {score.department_id.replace("_", "-")}
                </TableCell>
                <TableCell className="text-right">
                  {score.wins + score.losses + score.draws}
                </TableCell>
                <TableCell className="text-right">{score.wins}</TableCell>
                <TableCell className="text-right">{score.losses}</TableCell>
                <TableCell className="text-right">{score.draws}</TableCell>
                <TableCell className="text-right font-bold">
                  {score.points}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No scores recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default PointsTable;
