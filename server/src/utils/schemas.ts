import { z } from "zod";

// Reusable field schemas
export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");
export const nameSchema = z.string().min(1, "Name is required").optional();
export const usernameSchema = z
  .string()
  .min(4, "Username must be at least 4 characters")
  .max(20, "Username must be 20 characters or less")
  .regex(/^[a-z0-9_.]+$/, "Username cannot contain special characters")
  .lowercase("Username must be lowercase");

// Auth schemas
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

// Type inference
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// RANKING SCHEMAS

export const startRankingSchema = z.object({
  gId: z.string().min(1),
  rankingLevel: z.int().min(0).max(2),
});
export const continueRankingSchema = z.object({
  sessionId: z.string().min(1),
  seq: z.number(),
  choseNew: z.boolean(),
});
export const quitRankingSchema = z.object({
  sessionId: z.string().min(1),
});

export type StartRankingInput = z.infer<typeof startRankingSchema>;
export type ContinueRankingInput = z.infer<typeof continueRankingSchema>;
export type QuitRankingInput = z.infer<typeof quitRankingSchema>;
