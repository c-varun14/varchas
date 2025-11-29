"use client";

import { useMemo, useState } from "react";
import { Loader2, PencilLine, Plus, RefreshCcw, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEPARTMENTNAME as DEPARTMENT_VALUES,
  type DEPARTMENTNAME,
} from "@/app/generated/prisma/enums";
import { cn } from "@/lib/utils";

const DEPARTMENTS = Object.values(DEPARTMENT_VALUES) as DEPARTMENTNAME[];

export type CulturalWinnerDTO = {
  id: string;
  position: number;
  departmentName: DEPARTMENTNAME;
  points: number;
};

type FormState = {
  position: string;
  departmentName: DEPARTMENTNAME | "";
  points: string;
};

const DEFAULT_FORM_STATE: FormState = {
  position: "",
  departmentName: "",
  points: "",
};

type ManageCulturalWinnersProps = {
  eventId: string;
  initialWinners: CulturalWinnerDTO[];
};

const sortWinners = (winners: CulturalWinnerDTO[]) =>
  [...winners].sort((a, b) => a.position - b.position);

export default function ManageCulturalWinners({
  eventId,
  initialWinners,
}: ManageCulturalWinnersProps) {
  const [winners, setWinners] = useState(sortWinners(initialWinners));
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM_STATE);
  const [editingPosition, setEditingPosition] = useState<number | null>(null);
  const [editingWinnerId, setEditingWinnerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingWinnerId, setDeletingWinnerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFormDisabled = isSubmitting || isRefreshing;

  const resetForm = () => {
    setFormData(DEFAULT_FORM_STATE);
    setEditingPosition(null);
    setEditingWinnerId(null);
  };

  const fetchWinners = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cultural/${eventId}/winners`);
      if (!response.ok) {
        throw new Error("Failed to refresh winners");
      }

      const data = (await response.json()) as CulturalWinnerDTO[];
      setWinners(sortWinners(data));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to refresh winners"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const position = Number(formData.position);
    const points = Number(formData.points);

    if (!formData.position || Number.isNaN(position) || position <= 0) {
      setError("Please provide a valid position (1, 2, 3, ...)");
      return;
    }

    if (!formData.departmentName) {
      setError("Please select a department");
      return;
    }

    if (Number.isNaN(points) || points < 0) {
      setError("Points must be zero or a positive number");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const isEditing = Boolean(editingWinnerId);
      const response = await fetch(`/api/admin/cultural/${eventId}/winners`, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing
            ? {
                id: editingWinnerId,
                departmentName: formData.departmentName,
                points,
              }
            : {
                position,
                departmentName: formData.departmentName,
                points,
              }
        ),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data?.error ?? "Failed to save winner");
      }

      await fetchWinners();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save winner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (winner: CulturalWinnerDTO) => {
    setEditingPosition(winner.position);
    setEditingWinnerId(winner.id);
    setFormData({
      position: String(winner.position),
      departmentName: winner.departmentName,
      points: String(winner.points),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (winner: CulturalWinnerDTO) => {
    const confirmed = window.confirm(
      "Remove this winner position? This cannot be undone."
    );
    if (!confirmed) return;

    setDeletingWinnerId(winner.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cultural/${eventId}/winners`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: winner.id }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data?.error ?? "Failed to delete winner");
      }

      if (editingWinnerId === winner.id) {
        resetForm();
      }

      await fetchWinners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete winner");
    } finally {
      setDeletingWinnerId(null);
    }
  };

  const formTitle = editingPosition
    ? `Update position #${editingPosition}`
    : "Add winner";
  const formCta = editingPosition ? "Update winner" : "Add winner";
  const totalPositions = useMemo(() => winners.length, [winners]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">{formTitle}</h2>
            <p className="text-sm text-muted-foreground">
              Configure podium positions and awarded points for this cultural
              event.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchWinners}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Podium position</Label>
              <Input
                id="position"
                type="number"
                min={1}
                placeholder="e.g. 1"
                value={formData.position}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    position: event.target.value,
                  }))
                }
                disabled={isFormDisabled || editingPosition !== null}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentName}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    departmentName: value as DEPARTMENTNAME,
                  }))
                }
                disabled={isFormDisabled}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points awarded</Label>
              <Input
                id="points"
                type="number"
                min={0}
                placeholder="e.g. 10"
                value={formData.points}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    points: event.target.value,
                  }))
                }
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {formCta}
            </Button>
            {editingPosition !== null && (
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No winners added yet. Use the form above to record podium
                  results.
                </TableCell>
              </TableRow>
            ) : (
              winners.map((winner) => (
                <TableRow
                  key={winner.id}
                  className={cn(
                    editingPosition === winner.position &&
                      "bg-muted/20 dark:bg-slate-800/40"
                  )}
                >
                  <TableCell>#{winner.position}</TableCell>
                  <TableCell>{winner.departmentName}</TableCell>
                  <TableCell>{winner.points}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(winner)}
                      disabled={isFormDisabled}
                      aria-label="Edit winner"
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(winner)}
                      disabled={
                        deletingWinnerId === winner.id || isFormDisabled
                      }
                      aria-label="Delete winner"
                    >
                      {deletingWinnerId === winner.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableCaption>
            Managing {totalPositions} podium position
            {totalPositions === 1 ? "" : "s"}.
          </TableCaption>
        </Table>
      </div>
    </div>
  );
}
