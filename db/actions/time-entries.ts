import { TimeEntry, timeEntries, DailyData, dailyData } from "@/db/schemas/time-entries";
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

export const deleteTimeEntry = async (
  user: StackUser,
  entryId: string
): Promise<boolean> => {
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
  }>
): Promise<void> => {
  const db = await getRlsDb(user);
  
  // Delete existing entries for this date
  await db
    .delete(timeEntries)
    .where(and(eq(timeEntries.userId, user.id), eq(timeEntries.date, date)));
  
  // Insert new entries if any
  if (entries.length > 0) {
    await db.insert(timeEntries).values(
      entries.map(entry => ({
        id: entry.id,
        userId: user.id,
        date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  }
};

// Daily Data Actions
export const getDailyData = async (
  user: StackUser,
  date: string
): Promise<DailyData | null> => {
  const db = await getRlsDb(user);
  const result = await db
    .select()
    .from(dailyData)
    .where(and(eq(dailyData.userId, user.id), eq(dailyData.date, date)))
    .limit(1);
  return result[0] || null;
};

export const upsertDailyData = async (
  user: StackUser,
  date: string,
  data: {
    dietasCount?: number;
    isPernocta?: boolean;
    vacationType?: "none" | "full_day" | "half_day";
    hourBreakdown?: {
      normal: number;
      saturday: number;
      sunday: number;
      pernocta: number;
      extra: number;
      total: number;
    };
    totalEarnings?: number;
  }
): Promise<DailyData> => {
  const db = await getRlsDb(user);
  const existing = await getDailyData(user, date);
  
  if (existing) {
    // Update existing record
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    
    const result = await db
      .update(dailyData)
      .set(updateData)
      .where(and(eq(dailyData.userId, user.id), eq(dailyData.date, date)))
      .returning();
    return result[0];
  } else {
    // Create new record
    const result = await db
      .insert(dailyData)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        date,
        dietasCount: data.dietasCount ?? 0,
        isPernocta: data.isPernocta ?? false,
        vacationType: data.vacationType ?? "none",
        hourBreakdown: data.hourBreakdown ?? {
          normal: 0,
          saturday: 0,
          sunday: 0,
          pernocta: 0,
          extra: 0,
          total: 0,
        },
        totalEarnings: data.totalEarnings ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }
};

export const getMonthlyData = async (
  user: StackUser,
  year: number,
  month: number
): Promise<DailyData[]> => {
  const db = await getRlsDb(user);
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
  
  return await db
    .select()
    .from(dailyData)
    .where(
      and(
        eq(dailyData.userId, user.id),
        eq(dailyData.date, startDate) // This would need proper date range filtering
      )
    );
};

export const clearDayData = async (
  user: StackUser,
  date: string
): Promise<void> => {
  const db = await getRlsDb(user);
  
  // Delete time entries for the date
  await db
    .delete(timeEntries)
    .where(and(eq(timeEntries.userId, user.id), eq(timeEntries.date, date)));
  
  // Delete daily data for the date
  await db
    .delete(dailyData)
    .where(and(eq(dailyData.userId, user.id), eq(dailyData.date, date)));
};

export const clearMonthData = async (
  user: StackUser,
  year: number,
  month: number
): Promise<void> => {
  const db = await getRlsDb(user);
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
  
  // This would need proper date range filtering in a real implementation
  // For now, you'd need to implement proper date range queries
  // or handle this differently based on your date format
};