"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Users,
  CalendarPlus,
  MapPin,
  RefreshCcw,
  PencilLine,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CulturalEvent = {
  id: string;
  name: string;
  description: string | null;
  venue: string;
  startTime: string;
  endTime: string;
  solo: boolean;
  _count?: {
    winners: number;
  };
};

type FormState = {
  name: string;
  venue: string;
  description: string;
  startTime: string;
  endTime: string;
  solo: boolean;
};

const DEFAULT_FORM_STATE: FormState = {
  name: "",
  venue: "",
  description: "",
  startTime: "",
  endTime: "",
  solo: false,
};

const toInputValue = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - tzOffset * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const prettyDateTime = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "–";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function CulturalAdminPage() {
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM_STATE);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = editingEventId !== null;
  const formTitle = isEditing
    ? "Update cultural event"
    : "Add new cultural event";
  const formSubtitle = isEditing
    ? "Modify the schedule, venue or format for the selected event."
    : "Capture essential details including venue, timing and format.";
  const submitCta = isEditing ? "Update event" : "Create event";

  const resetForm = () => {
    setFormData(DEFAULT_FORM_STATE);
    setEditingEventId(null);
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/cultural");
      if (!response.ok) {
        throw new Error("Failed to fetch cultural events");
      }
      const data = (await response.json()) as CulturalEvent[];
      setEvents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load cultural events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name || !formData.venue) {
      setError("Please fill in all required fields");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError("Start time and end time are required");
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Please provide valid date & time values");
      return;
    }

    if (start >= end) {
      setError("Start time must be before end time");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        venue: formData.venue,
        description: formData.description || null,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        solo: formData.solo,
      };

      if (editingEventId) {
        payload.id = editingEventId;
      }

      const response = await fetch("/api/admin/cultural", {
        method: editingEventId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({}));
        throw new Error(
          typeof message?.error === "string"
            ? message.error
            : "Failed to create cultural event"
        );
      }

      await fetchEvents();
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditing
          ? "Failed to update event"
          : "Failed to create event"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event: CulturalEvent) => {
    setEditingEventId(event.id);
    setFormData({
      name: event.name,
      venue: event.venue,
      description: event.description ?? "",
      startTime: toInputValue(event.startTime),
      endTime: toInputValue(event.endTime),
      solo: event.solo,
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setError(null);
  };

  const totalEvents = useMemo(() => events.length, [events]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cultural Events Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage the festival cultural schedule and podium results.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{formSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{totalEvents} scheduled</Badge>
            {isEditing && <Badge variant="default">Editing</Badge>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">Event name</Label>
              <Input
                id="name"
                placeholder="E.g. Battle of Bands"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="Auditorium, Amphitheatre, ..."
                value={formData.venue}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, venue: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="start">Start time</Label>
              <Input
                id="start"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End time</Label>
              <Input
                id="end"
                type="datetime-local"
                min={formData.startTime}
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional context, judging criteria, or notes for admins"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              minLength={0}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 p-4">
            <div>
              <Label htmlFor="solo" className="text-sm font-medium">
                Solo performance
              </Label>
              <p className="text-xs text-muted-foreground">
                Toggle if this event awards points to individuals rather than
                teams.
              </p>
            </div>
            <Switch
              id="solo"
              checked={formData.solo}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, solo: checked }))
              }
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                submitCta
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Scheduled cultural events
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className={cn(
                  "hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden",
                  editingEventId === event.id &&
                    "border-primary/60 ring-2 ring-primary/30 shadow-lg"
                )}
              >
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-700 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <CalendarPlus className="h-3.5 w-3.5" />
                        <span>{prettyDateTime(event.startTime)}</span>
                      </CardDescription>
                    </div>
                    <Badge
                      variant={event.solo ? "secondary" : "outline"}
                      className="shrink-0"
                    >
                      {event.solo ? "Solo" : "Team"}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ends {prettyDateTime(event.endTime)}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col w-full gap-2">
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => handleEdit(event)}
                        disabled={submitting}
                      >
                        <PencilLine className="h-4 w-4" />
                        {editingEventId === event.id ? "Editing" : "Edit event"}
                      </Button>
                      <Link
                        href={`/admin/cultural/${event.id}`}
                        className={cn(
                          buttonVariants({ variant: "default" }),
                          "flex-1 flex items-center justify-center gap-2"
                        )}
                      >
                        <Users className="h-4 w-4" />
                        Manage winners
                        <Badge variant="secondary" className="ml-1">
                          {event._count?.winners ?? 0}
                        </Badge>
                      </Link>
                    </div>
                    {/* <div className="text-[11px] text-muted-foreground text-center">
                      Lasts from {prettyDateTime(event.startTime)} to{" "}
                      {prettyDateTime(event.endTime)}
                    </div> */}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No cultural events yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Use the form above to schedule the first cultural event and start
              tracking results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
