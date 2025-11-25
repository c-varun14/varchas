export type FixtureDTO = {
  id: string;
  department_1: string;
  department_2: string;
  start_time: string;
  end_time: string;
  score: string;
};

export type FixtureStatus = "pending" | "happening" | "completed";

export const getFixtureStatus = (fixture: FixtureDTO): FixtureStatus => {
  const now = new Date().getTime();
  const start = new Date(fixture.start_time).getTime();
  const end = new Date(fixture.end_time).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return "pending";
  if (now < start) return "pending";
  if (now >= start && now < end) return "happening";
  return "completed";
};
