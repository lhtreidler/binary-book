import z from "zod";

export type ZodS<T extends ZodS<any>> = z.infer<T>;
