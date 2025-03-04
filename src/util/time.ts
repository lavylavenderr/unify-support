import { DateTime } from "luxon";

const timePattern = /(?<value>\d+)(?<unit>[smhdw])/g;

type TimeUnits = {
  [key: string]: "seconds" | "minutes" | "hours" | "days" | "weeks";
};

const unitMap: TimeUnits = {
  s: "seconds",
  m: "minutes",
  h: "hours",
  d: "days",
  w: "weeks",
};

export function parseRelativeTime(input: string): DateTime | null {
  let duration: { [key: string]: number } = {};
  let match;

  while ((match = timePattern.exec(input)) !== null) {
    const { value, unit } = match.groups!;
    if (unitMap[unit]) {
      duration[unitMap[unit]] = parseInt(value, 10);
    }
  }

  if (Object.keys(duration).length === 0) return null;
  return DateTime.now().plus(duration);
}
