"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PointsTable, { type DepartmentScore } from "./PointsTable";
import { DEPARTMENTNAMES } from "@/app/utils/DEPARTMENTS";

type FormState = {
  wins: number;
  losses: number;
  points: number;
};

const DEFAULT_FORM_STATE: FormState = {
  wins: 0,
  losses: 0,
  points: 0,
};

type PointsTableProps = {
  sportsId: string;
  initialScores: DepartmentScore[];
};

export default function EditPoints({
  sportsId,
  initialScores,
}: PointsTableProps) {
  const [scores, setScores] = useState<DepartmentScore[]>(initialScores);
  const [selectedDept, setSelectedDept] = useState<string | "">("");
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDept(departmentId);
    setError(null);

    const departmentScore = scores.find(
      (score) => score.department_id === departmentId
    );

    setFormData({
      wins: departmentScore?.wins ?? 0,
      losses: departmentScore?.losses ?? 0,
      points: departmentScore?.points ?? 0,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDept) {
      setError("Please select a department");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/sports/${sportsId}/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department_id: selectedDept,
          wins: formData.wins,
          losses: formData.losses,
          points: formData.points,
          id: initialScores[0].id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update scores");
      }

      const updatedScores: DepartmentScore[] = await response.json();
      setScores(updatedScores);
      setFormData(DEFAULT_FORM_STATE);
      setSelectedDept("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update scores");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormDisabled = !selectedDept;

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Update Department Scores</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={selectedDept}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTNAMES.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedDept && (
                <p className="text-sm text-muted-foreground mt-2">
                  Select a department to load its current record.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="wins">Wins</Label>
              <Input
                type="number"
                id="wins"
                value={formData.wins}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    wins: parseInt(event.target.value) || 0,
                  })
                }
                min="0"
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <Label htmlFor="losses">Losses</Label>
              <Input
                type="number"
                id="losses"
                value={formData.losses}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    losses: parseInt(event.target.value) || 0,
                  })
                }
                min="0"
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                type="number"
                id="points"
                value={formData.points}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    points: parseInt(event.target.value) || 0,
                  })
                }
                disabled={isFormDisabled}
              />
            </div>
          </div>
          <Button type="submit" disabled={isSaving || isFormDisabled}>
            {isSaving ? "Updating..." : "Update Scores"}
          </Button>
        </form>
      </div>
      <PointsTable scores={scores} />
    </>
  );
}
