import { UserConfig, userConfig } from "@/db/schemas/config";
import { eq } from "drizzle-orm";
import { getRlsDb, StackUser } from "../db";

export const getUserConfig = async (user: StackUser): Promise<UserConfig | null> => {
  const db = await getRlsDb(user);
  const existingConfigs = await db
    .select()
    .from(userConfig)
    .where(eq(userConfig.userId, user.id))
    .limit(1);
  return existingConfigs[0] || null;
};

type ConfigInput = Partial<Omit<UserConfig, "id" | "userId" | "createdAt" | "updatedAt">>;

export const getOrCreateUserConfig = async (
  user: StackUser,
  data: ConfigInput = {}
): Promise<UserConfig> => {
  const existingConfig = await getUserConfig(user);
  if (existingConfig) {
    return existingConfig;
  }

  return await createUserConfig(user, data);
};

export const createUserConfig = async (user: StackUser, data: ConfigInput): Promise<UserConfig> => {
  const db = await getRlsDb(user);
  const result = await db
    .insert(userConfig)
    .values({
      ...getDefaultConfig(user, data)
    })
    .returning();
  return result[0];
};

const getDefaultConfig = (user: StackUser, data: ConfigInput): Omit<UserConfig, "id" | "createdAt" | "updatedAt"> => {
  return {
    userId: user.id,
    annualSalary: data.annualSalary ?? "0",
    weeklyHours: data.weeklyHours ?? "40",
    paymentType: data.paymentType ?? "0",
    extraRate: data.extraRate ?? "0",
    saturdayRate: data.saturdayRate ?? "0",
    sundayRate: data.sundayRate ?? "0",
    dailyHourLimit: data.dailyHourLimit ?? "0",
    hasDieta: data.hasDieta ?? false,
    dietaPrice: data.dietaPrice ?? "0",
    hasPernocta: data.hasPernocta ?? false,
    pernoctaPrice: data.pernoctaPrice ?? "0",
    maxVacationDays: data.maxVacationDays ?? "0",
  };
};

export const updateUserConfig = async (
  user: StackUser,
  data: ConfigInput
): Promise<UserConfig | null> => {
  const db = await getRlsDb(user);
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const result = await db
    .update(userConfig)
    .set(updateData)
    .where(eq(userConfig.userId, user.id))
    .returning();
  return result.length > 0 ? result[0] : null;
};

// Partial update function - only updates specified fields
export const updateUserConfigFields = async (
  user: StackUser,
  fields: Partial<ConfigInput>
): Promise<UserConfig | null> => {
  if (Object.keys(fields).length === 0) {
    return await getUserConfig(user);
  }

  const db = await getRlsDb(user);
  const updateData = {
    ...fields,
    updatedAt: new Date(),
  };

  const result = await db
    .update(userConfig)
    .set(updateData)
    .where(eq(userConfig.userId, user.id))
    .returning();
  return result.length > 0 ? result[0] : null;
};
