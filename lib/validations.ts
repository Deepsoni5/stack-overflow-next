import { z } from "zod";
export const QuestionSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be atleast 5 characters!" })
    .max(130),
  explaination: z.string().min(100),
  tags: z.array(z.string().min(1).max(15).min(1).max(3)),
});
