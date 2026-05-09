import z from "zod";

export type ZodS<T extends ZodS<any>> = z.infer<T>;

export type WithOptional<T extends object, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type OmitSystem<T extends object> = Omit<
  T,
  "updatedAt" | "createdAt" | "id"
>;
