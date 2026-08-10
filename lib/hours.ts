// Sourced from the clinic's live Google Business Profile.
// Two shifts most days; Friday is evening-only.
export const weeklyHours = [
  { day: "Monday", shifts: ["12:00 – 4:00 PM", "7:15 – 11:00 PM"] },
  { day: "Tuesday", shifts: ["12:00 – 4:00 PM", "7:15 – 11:00 PM"] },
  { day: "Wednesday", shifts: ["12:00 – 4:00 PM", "7:15 – 11:00 PM"] },
  { day: "Thursday", shifts: ["12:00 – 4:00 PM", "7:15 – 11:00 PM"] },
  { day: "Friday", shifts: ["7:15 – 11:00 PM"] },
  { day: "Saturday", shifts: ["12:00 – 4:00 PM", "7:15 – 11:00 PM"] },
  { day: "Sunday", shifts: ["12:00 – 4:00 PM", "7:15 – 11:00 PM"] },
] as const;

export function todaysHours(): readonly string[] {
  const dayIndex = new Date().getDay(); // 0 = Sunday ... 6 = Saturday
  const jsToMonFirst = [6, 0, 1, 2, 3, 4, 5]; // maps JS day index -> index in weeklyHours (Mon-first)
  const idx = jsToMonFirst[dayIndex];
  return weeklyHours[idx]?.shifts ?? [];
}
