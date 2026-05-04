import { z } from "zod";

const phoneRegex = /^\+?[\d\s().-]{8,20}$/;

export const voteBodySchema = z
  .object({
    topicId: z.string().cuid(),
    optionId: z.string().cuid(),
    identifierType: z.enum(["EMAIL", "PHONE"]),
    identifier: z.string().min(3).max(320).trim(),
  })
  .superRefine((data, ctx) => {
    if (data.identifierType === "EMAIL") {
      const r = z.string().email().safeParse(data.identifier);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid email address",
          path: ["identifier"],
        });
      }
    } else if (!phoneRegex.test(data.identifier)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid phone number",
        path: ["identifier"],
      });
    }
  });

export const loginBodySchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(200),
});

export const topicCreateSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(20000).trim(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]),
  featured: z.boolean().optional(),
  /** HTML datetime-local or ISO; empty string clears */
  startDate: z.string().max(40).nullable().optional(),
  endDate: z.string().max(40).nullable().optional(),
  options: z.array(z.string().min(1).max(500).trim()).min(2).max(20),
});

export const topicUpdateSchema = topicCreateSchema.partial().extend({
  options: z.array(z.string().min(1).max(500).trim()).min(2).max(20).optional(),
});
