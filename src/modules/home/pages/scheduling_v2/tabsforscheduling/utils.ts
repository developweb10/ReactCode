import { Shift } from "./types";

/**
 * Calculates the dates for the current week (Sunday to Saturday) based on a given date.
 * @param currentDate The date to base the week calculation on.
 * @returns An array of Date objects for the week.
 */
export const getWeekDates = (currentDate: Date): Date[] => {
  const week = [];
  const date = new Date(currentDate);
  const day = date.getDay(); // 0 for Sunday ... 6 for Saturday
  const sunday = new Date(date.setDate(date.getDate() - day));
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(sunday);
    nextDay.setDate(sunday.getDate() + i);
    week.push(nextDay);
  }
  return week;
};

/**
 * Calculates the dates for the current month.
 * @param currentDate The date to base the month calculation on.
 * @returns An array of Date objects for the month.
 */
export const getMonthDates = (currentDate: Date): Date[] => {
  const dates = [];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0); // Day 0 of next month is last day of current month

  for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
};

/**
 * Calculates the dates for a single day.
 * @param currentDate The date to display.
 * @returns An array containing a single Date object.
 */
export const getDayDates = (currentDate: Date): Date[] => {
  return [new Date(currentDate)];
};

export const getUpcomingSundayWeekDates = (baseDate: Date): Date[] => {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysUntilNextSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;

  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilNextSunday);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(nextSunday);
    day.setDate(nextSunday.getDate() + i);
    return day;
  });
};

export const getDateKeysInRange = (startDate: Date, endDate: Date): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const keys: string[] = [];
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    keys.push(formatDate(day, "key"));
  }
  return keys;
};

export const buildDateChunksFromKeys = (
  dateKeys: string[],
  maxChunkSize = 7,
): Array<{ start: string; end: string }> => {
  if (dateKeys.length === 0) return [];

  const sortedKeys = Array.from(new Set(dateKeys)).sort();
  const chunks: Array<{ start: string; end: string }> = [];
  let chunkStart = sortedKeys[0];
  let chunkEnd = sortedKeys[0];
  let chunkCount = 1;

  const isNextDay = (prevKey: string, nextKey: string) => {
    const prev = new Date(prevKey);
    const next = new Date(nextKey);
    const diff = (next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    return diff === 1;
  };

  for (let i = 1; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const canExtend = isNextDay(chunkEnd, key) && chunkCount < maxChunkSize;
    if (canExtend) {
      chunkEnd = key;
      chunkCount++;
      continue;
    }

    chunks.push({ start: chunkStart, end: chunkEnd });
    chunkStart = key;
    chunkEnd = key;
    chunkCount = 1;
  }

  chunks.push({ start: chunkStart, end: chunkEnd });
  return chunks;
};

/**
 * Formats a Date object into various string formats.
 * @param date The Date object to format.
 * @param format The desired format ("short", "long", "key", "full", "day-date").
 * @returns The formatted date string.
 */
export const formatDate = (
  date: Date,
  format: "short" | "long" | "key" | "full" | "day-date",
): string => {
  if (format === "short")
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
    });
  if (format === "long")
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  if (format === "full")
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  if (format === "key") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (format === "day-date") {
    // "Tue 22" format - Fixed to explicitly format
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumeric = date.toLocaleDateString("en-US", { day: "numeric" });
    return `${weekday} ${dayNumeric}`;
  }
  return "";
};

/**
 * Creates a downloadable file from data.
 * @param filename The name of the file to download.
 * @param content The file content as a string.
 * @param mimeType The MIME type of the file.
 */
export const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "";

  // Create a date object. If your API returns YYYY-MM-DD,
  // we split to avoid timezone shifts.
  const date = new Date(dateString);

  // If the date is invalid, try manual parsing for YYYY-MM-DD
  if (isNaN(date.getTime())) {
    const [year, month, day] = dateString.split(/[-/]/);
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const parseBooleanLike = (value: any): boolean | undefined => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value === "string") {
    const normalized = value?.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes")
      return true;
    if (normalized === "false" || normalized === "0" || normalized === "no")
      return false;
  }
  return undefined;
};

export const parseDriverConfirmedStatus = (value: any): boolean | undefined =>
  parseBooleanLike(value);

export const isAvailabilityMarkedAvailable = (availability?: Shift | any | null): boolean => {
  if (!availability) return false;
  const status = (availability.shift_status || availability.availability_status)?.trim().toLowerCase();
  const name = (availability.shift_name || availability.availability_name)?.trim().toLowerCase();

  return status === "available" || name === "available";
};

export const isVehicleInactive = (status?: string) => status?.trim() === "0";

/**
 * Validates that an array of date strings does not contain more than `maxAllowed` consecutive days.
 * @param dateStrings Array of date strings in YYYY-MM-DD format.
 * @param maxAllowed Maximum allowed consecutive days (default 6).
 * @returns Validation result with status, max streak, and error message if invalid.
 */
export const validateConsecutiveAvailableDays = (
  dateStrings: string[],
  maxAllowed: number = 6,
): { isValid: boolean; maxStreak: number; message?: string } => {
  if (!dateStrings || dateStrings.length <= maxAllowed) {
    return { isValid: true, maxStreak: dateStrings?.length || 0 };
  }

  // Remove duplicates and sort chronologically
  const uniqueSortedDates = Array.from(new Set(dateStrings))
    .map((d) => {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(Date.UTC(y, m - 1, day));
    })
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (uniqueSortedDates.length <= maxAllowed) {
    return { isValid: true, maxStreak: uniqueSortedDates.length };
  }

  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const prev = uniqueSortedDates[i - 1];
    const curr = uniqueSortedDates[i];

    // Difference in calendar days (using UTC timestamp)
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 1;
    }
  }

  if (maxStreak > maxAllowed) {
    return {
      isValid: false,
      maxStreak,
      message: `Driver cannot be available for more than ${maxAllowed} consecutive days. At least 1 day break is required.`,
    };
  }

  return { isValid: true, maxStreak };
};

