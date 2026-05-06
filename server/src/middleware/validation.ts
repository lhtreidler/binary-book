import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, z } from "zod";

// Custom Request type with validated body
export interface ValidatedRequest<T> extends Request {
  validatedBody: T;
}

/**
 * Generic middleware factory for validating request body against a Zod schema
 * Provides proper TypeScript typing for the validated body
 * Usage: app.post('/route', validateBody(schema), (req: ValidatedRequest<MyType>, res) => {...})
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      (req as any).validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.length > 0 ? issue.path.join(".") : "root",
          message: issue.message,
          code: issue.code,
        }));
        res.status(400).json({
          error: "Validation failed",
          details: formattedErrors,
        });
        return;
      }
      console.error("Unexpected validation error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  };
}

/**
 * Standalone validation function for use within route handlers
 * Useful when you need more control over the validation process
 */
export async function validateRequest<T>(
  schema: ZodSchema,
  data: unknown,
): Promise<{ success: true; data: T } | { success: false; errors: any[] }> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated as T };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "root",
        message: issue.message,
        code: issue.code,
      }));
      return { success: false, errors: formattedErrors };
    }
    return { success: false, errors: [{ message: "Validation error" }] };
  }
}
