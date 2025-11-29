"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2, Eye, Trash2, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SportEvent = {
  id: string;
  name: string;
  gender: string;
  additional_data_name: string;
  solo: boolean;
};

export default function SportsAdminPage() {
  const [sports, setSports] = useState<SportEvent[]>([]);
  const [newSport, setNewSport] = useState<{
    name: string;
    gender: string;
    solo: boolean;
  }>({ name: "", gender: "", solo: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSports = async () => {
    try {
      const response = await fetch("/api/admin/sports");
      if (!response.ok) throw new Error("Failed to fetch sports");
      const data = await response.json();
      setSports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sports");
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSport.name || !newSport.gender) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/sports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSport),
      });

      if (!response.ok) {
        throw new Error("Failed to add sport");
      }

      // Refresh the list
      await fetchSports();
      // Reset form
      setNewSport({
        name: "",
        gender: "",
        solo: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add sport");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sports Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage sports events and their configurations
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New Sport
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sports.length} sports configured
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="sport"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Sport
              </Label>
              <Input
                id="sport"
                placeholder="Enter sport name"
                value={newSport.name}
                onChange={(e) =>
                  setNewSport({ ...newSport, name: e.target.value })
                }
                className="h-10"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Gender
              </Label>
              <Select
                value={newSport.gender}
                onValueChange={(value) =>
                  setNewSport({ ...newSport, gender: value })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="solo"
                  checked={newSport.solo}
                  onChange={(e) =>
                    setNewSport({ ...newSport, solo: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div className="flex flex-col">
                <Label
                  htmlFor="solo"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Solo Event
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {newSport.solo
                    ? "Individual participation"
                    : "Team-based participation"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || !newSport.name || !newSport.gender}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Sport"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Sports
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {sports.length} {sports.length === 1 ? "sport" : "sports"} total
            </span>
          </div>
        </div>

        {sports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sports.map((sport) => (
              <Card
                key={`${sport.name}-${sport.gender}`}
                className="hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {sport.name}
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
                <CardContent className="">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </span>
                      <Badge
                        variant={sport.solo ? "outline" : "secondary"}
                        className="capitalize"
                      >
                        {sport.solo ? "Solo" : "Team"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col justify-between w-full space-x-2">
                    <Link
                      href={`/admin/sports/${sport.id}/points`}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "flex items-center justify-center"
                      )}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Edit leaderboard
                    </Link>
                    <Link
                      href={`/admin/sports/${sport.id}/fixtures`}
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "flex items-center justify-center mt-2"
                      )}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Edit fixtures
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No sports added
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
              Get started by adding a new sport using the form above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
