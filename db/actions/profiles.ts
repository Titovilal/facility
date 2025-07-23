import { Profile, profiles } from "@/db/schemas/profiles";
import { fetchApi } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { getAdminDb, getRlsDb, StackUser } from "../db";

export const getProfile = async (user: StackUser): Promise<Profile | null> => {
  const db = await getRlsDb(user);
  const existingProfiles = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  return existingProfiles[0];
};

type ProfileInput = Partial<Omit<Profile, "id" | "userId" | "createdAt" | "updatedAt">>;

export const getOrCreateProfile = async (
  user: StackUser,
  data: ProfileInput = {}
): Promise<Profile> => {
  const existingProfile = await getProfile(user);
  if (existingProfile) {
    return existingProfile;
  }
  const result = await fetchApi<{ profile: Profile }>("/api/profiles", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (result.error || !result.data || !result.data.profile) {
    throw new Error("Failed to create profile: " + (result.error?.message || "Unknown error"));
  }

  return result.data.profile;
};

export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  const db = await getAdminDb();
  const results = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return results.length > 0 ? results[0] : null;
};

export const createProfile = async (user: StackUser, data: ProfileInput): Promise<Profile> => {
  const db = await getAdminDb();
  const result = await db.insert(profiles).values(getDefaultProfile(user, data)).returning();
  return result[0];
};

const getDefaultProfile = (user: StackUser, data: ProfileInput): Omit<Profile, "id"> => {
  return {
    userId: user.id,
    subCredits: data.subCredits ?? 0,
    otpCredits: data.otpCredits ?? 0,
    initialSubDate: data.initialSubDate ?? null,
    lastOtpDate: data.lastOtpDate ?? null,
    priceId: data.priceId ?? "",
    customerId: data.customerId ?? "",
    name: user.displayName ?? data.name ?? "",
    mail: user.primaryEmail ?? data.mail ?? "",
    cancelNextMonth: data.cancelNextMonth ?? false,
    hasSub: data.hasSub ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const getProfileByCustomerId = async (customerId: string): Promise<Profile | null> => {
  const db = await getAdminDb();
  const results = await db
    .select()
    .from(profiles)
    .where(eq(profiles.customerId, customerId))
    .limit(1);
  return results.length > 0 ? results[0] : null;
};

export const updateProfileByCustomerId = async (
  customerId: string,
  data: ProfileInput
): Promise<Profile | null> => {
  const db = await getAdminDb();
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const result = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.customerId, customerId))
    .returning();
  return result.length > 0 ? result[0] : null;
};

export const updateProfileByUserId = async (
  userId: string,
  data: ProfileInput
): Promise<Profile | null> => {
  const db = await getAdminDb();
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const result = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.userId, userId))
    .returning();
  return result.length > 0 ? result[0] : null;
};
