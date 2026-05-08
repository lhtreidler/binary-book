import { z } from "zod";

// Reusable field schemas
export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");
export const nameSchema = z.string().min(1, "Name is required").optional();
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .optional();

// Auth schemas
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  username: usernameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Type inference
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// RANKING SCHEMAS

export const startRankingSchema = z.object({
  gId: z.string().min(1),
  rankingLevel: z.int().min(0).max(2),
});
export const continueRankingSchema = z.object({
  sessionId: z.string().min(1),
  choseNew: z.boolean(),
});

export type StartRankingInput = z.infer<typeof startRankingSchema>;
export type ContinueRankingInput = z.infer<typeof continueRankingSchema>;
