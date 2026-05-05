import { z } from "zod";

export const voteBodySchema = z.object({
  topicId: z.string().min(1),
  optionId: z.string().min(1),
  identifier: z.string().min(1).max(200).trim(),
  identifierType: z.enum(["EMAIL", "PHONE"]),
});

export const loginBodySchema = z.object({
  username: z.string().min(1).max(80).trim(),
  password: z.string().min(1).max(200),
});

export const createTopicSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().optional().default(""),
  options: z.array(z.string().min(1).max(200).trim()).min(2).max(20),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).optional().default("ACTIVE"),
  featured: z.boolean().optional().default(false),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

export const patchTopicSchema = createTopicSchema.partial();
