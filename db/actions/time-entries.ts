import { TimeEntry, timeEntries } from "@/db/schemas/time-entries";
import { eq, and } from "drizzle-orm";
import { getRlsDb, StackUser } from "../db";

// Time Entries Actions
export const getTimeEntriesForDate = async (
  user: StackUser,
  date: string
): Promise<TimeEntry[]> => {
  const db = await getRlsDb(user);
  return await db
    .select()
    .from(timeEntries)
    .where(and(eq(timeEntries.userId, user.id), eq(timeEntries.date, date)));
};

export const createTimeEntry = async (
  user: StackUser,
  data: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    dietasCount?: number;
    isPernocta?: boolean;
    vacationType?: "none" | "full_day" | "half_day";
  }
): Promise<TimeEntry> => {
  const db = await getRlsDb(user);
  const result = await db
    .insert(timeEntries)
    .values({
      id: data.id,
      userId: user.id,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      dietasCount: data.dietasCount ?? 0,
      isPernocta: data.isPernocta ?? false,
      vacationType: data.vacationType ?? "none",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return result[0];
};

export const updateTimeEntry = async (
  user: StackUser,
  entryId: string,
  data: {
    startTime?: string;
    endTime?: string;
    dietasCount?: number;
    isPernocta?: boolean;
    vacationType?: "none" | "full_day" | "half_day";
  }
): Promise<TimeEntry | null> => {
  const db = await getRlsDb(user);
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const result = await db
    .update(timeEntries)
    .set(updateData)
    .where(and(eq(timeEntries.id, entryId), eq(timeEntries.userId, user.id)))
    .returning();
  return result.length > 0 ? result[0] : null;
};

export const deleteTimeEntry = async (user: StackUser, entryId: string): Promise<boolean> => {
  const db = await getRlsDb(user);
  const result = await db
    .delete(timeEntries)
    .where(and(eq(timeEntries.id, entryId), eq(timeEntries.userId, user.id)))
    .returning();
  return result.length > 0;
};

export const syncTimeEntriesForDate = async (
  user: StackUser,
  date: string,
  entries: Array<{
    id: string;
    startTime: string;
    endTime: string;
  }>,
  dayData?: {
    dietasCount?: number;
    isPernocta?: boolean;
    vacationType?: "none" | "full_day" | "half_day";
  }
): Promise<void> => {
  const db = await getRlsDb(user);

  // Delete existing entries for this date
  await db
    .delete(timeEntries)
    .where(and(eq(timeEntries.userId, user.id), eq(timeEntries.date, date)));

  // Insert new entries if any
  if (entries.length > 0) {
    await db.insert(timeEntries).values(
      entries.map((entry) => ({
        id: entry.id,
        userId: user.id,
        date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        dietasCount: dayData?.dietasCount ?? 0,
        isPernocta: dayData?.isPernocta ?? false,
        vacationType: dayData?.vacationType ?? "none",
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  }
};

// Helper function to get day data from time entries
export const getDayDataFromEntries = (entries: TimeEntry[]) => {
  if (entries.length === 0) return null;
  
  // All entries for a date should have the same day-level data
  const firstEntry = entries[0];
  return {
    dietasCount: firstEntry.dietasCount,
    isPernocta: firstEntry.isPernocta,
    vacationType: firstEntry.vacationType,
  };
};

export const clearDayData = async (user: StackUser, date: string): Promise<void> => {
  const db = await getRlsDb(user);

  // Delete time entries for the date
  await db
    .delete(timeEntries)
    .where(and(eq(timeEntries.userId, user.id), eq(timeEntries.date, date)));
};
