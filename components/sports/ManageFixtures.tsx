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
import { Badge } from "@/components/ui/badge";
import {
  DEPARTMENTNAME as DEPARTMENT_VALUES,
  type DEPARTMENTNAME,
} from "@/app/generated/prisma/enums";

const DEPARTMENTS = Object.values(DEPARTMENT_VALUES) as DEPARTMENTNAME[];

type FixtureDTO = {
  id: string;
  department_1: DEPARTMENTNAME;
  department_2: DEPARTMENTNAME;
  start_time: string;
  end_time: string;
  score: string;
};

type FixtureStatus = "pending" | "happening" | "completed";

type FixtureFormState = {
  department_1: DEPARTMENTNAME | "";
  department_2: DEPARTMENTNAME | "";
  start_time: string;
  end_time: string;
  score: string;
};

const DEFAULT_FORM_STATE: FixtureFormState = {
  department_1: "",
  department_2: "",
  start_time: "",
  end_time: "",
  score: "",
};

type ManageFixturesProps = {
  sportsId: string;
  initialFixtures: FixtureDTO[];
};

const toInputValue = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - tzOffset * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const prettyDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const sortFixtures = (fixtures: FixtureDTO[]) =>
  [...fixtures].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

const getFixtureStatus = (fixture: FixtureDTO): FixtureStatus => {
  const now = Date.now();
  const start = new Date(fixture.start_time).getTime();
  const end = new Date(fixture.end_time).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return "pending";

  if (now < start) return "pending";
  if (now >= start && now < end) return "happening";
  return "completed";
};

const STATUS_META: Record<FixtureStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
    },
    happening: {
      label: "Happening",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200",
    },
    completed: {
      label: "Completed",
      className:
        "bg-slate-200 text-slate-800 dark:bg-slate-700/40 dark:text-slate-200",
    },
  };

export default function ManageFixtures({
  sportsId,
  initialFixtures,
}: ManageFixturesProps) {
  const [fixtures, setFixtures] = useState<FixtureDTO[]>(
    sortFixtures(initialFixtures)
  );
  const [formData, setFormData] =
    useState<FixtureFormState>(DEFAULT_FORM_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formTitle = editingId ? "Update fixture" : "Create fixture";
  const formCta = editingId ? "Update fixture" : "Add fixture";

  const isFormDisabled = isSubmitting || isRefreshing;

  const resetForm = () => {
    setFormData(DEFAULT_FORM_STATE);
    setEditingId(null);
  };

  const fetchFixtures = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/sports/${sportsId}/fixtures`);
      if (!response.ok) {
        throw new Error("Failed to refresh fixtures");
      }
      const data: FixtureDTO[] = await response.json();
      setFixtures(sortFixtures(data));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to refresh fixtures"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.department_1 ||
      !formData.department_2 ||
      formData.department_1 === formData.department_2
    ) {
      setError("Please choose two different departments");
      return;
    }

    if (!formData.end_time) {
      setError("Please select a match time");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        department_1: formData.department_1,
        department_2: formData.department_2,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        score: formData.score.trim(),
      };

      const method = editingId ? "PATCH" : "POST";
      if (editingId) {
        payload.id = editingId;
      }

      const response = await fetch(`/api/admin/sports/${sportsId}/fixtures`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data?.error ?? "Failed to save fixture");
      }

      await fetchFixtures();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fixture");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (fixture: FixtureDTO) => {
    setEditingId(fixture.id);
    setFormData({
      department_1: fixture.department_1,
      department_2: fixture.department_2,
      start_time: toInputValue(fixture.start_time),
      end_time: toInputValue(fixture.end_time),
      score: fixture.score,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (fixtureId: string) => {
    const confirmed = window.confirm(
      "Delete this fixture? This cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(fixtureId);
    setError(null);
    try {
      const response = await fetch(`/api/admin/sports/${sportsId}/fixtures`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: fixtureId }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data?.error ?? "Failed to delete fixture");
      }

      if (editingId === fixtureId) {
        resetForm();
      }

      await fetchFixtures();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete fixture");
    } finally {
      setDeletingId(null);
    }
  };

  const upcomingCount = useMemo(() => fixtures.length, [fixtures]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">{formTitle}</h2>
            <p className="text-sm text-muted-foreground">
              Configure head-to-head fixtures between departments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{upcomingCount} scheduled</Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchFixtures}
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
              <Label>Department 1</Label>
              <Select
                value={formData.department_1}
                onValueChange={(value: DEPARTMENTNAME) =>
                  setFormData((prev) => ({ ...prev, department_1: value }))
                }
                disabled={isFormDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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

            <div className="space-y-2">
              <Label>Department 2</Label>
              <Select
                value={formData.department_2}
                onValueChange={(value: DEPARTMENTNAME) =>
                  setFormData((prev) => ({ ...prev, department_2: value }))
                }
                disabled={isFormDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select opponent" />
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
              <Label htmlFor="start_time">Match start time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_time: event.target.value,
                  }))
                }
                disabled={isFormDisabled}
                min={toInputValue(new Date().toISOString())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Match end time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    end_time: event.target.value,
                  }))
                }
                disabled={isFormDisabled}
                min={
                  formData.start_time || toInputValue(new Date().toISOString())
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                placeholder="e.g. 21 - 15"
                value={formData.score}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    score: event.target.value,
                  }))
                }
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isFormDisabled} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {formCta}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                disabled={isFormDisabled}
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
              <TableHead>Departments</TableHead>
              <TableHead>Match start</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixtures.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No fixtures yet. Use the form above to create one.
                </TableCell>
              </TableRow>
            ) : (
              fixtures.map((fixture) => (
                <TableRow key={fixture.id}>
                  <TableCell>
                    <div className="font-medium">
                      {fixture.department_1} vs {fixture.department_2}
                    </div>
                  </TableCell>
                  <TableCell>{prettyDateTime(fixture.start_time)}</TableCell>
                  <TableCell>
                    {(() => {
                      const status = getFixtureStatus(fixture);
                      const meta = STATUS_META[status];
                      return (
                        <Badge variant="outline" className={meta.className}>
                          {meta.label}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {fixture.score ? (
                      <Badge variant="outline">{fixture.score}</Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        Not recorded
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(fixture)}
                      disabled={isFormDisabled}
                      aria-label="Edit fixture"
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(fixture.id)}
                      disabled={deletingId === fixture.id || isFormDisabled}
                      aria-label="Delete fixture"
                    >
                      {deletingId === fixture.id ? (
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
            Fixtures are sorted chronologically. Editing a row will load it into
            the form above.
          </TableCaption>
        </Table>
      </div>
    </div>
  );
}
