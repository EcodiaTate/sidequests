import { z } from "zod";

export const contactSubjects = ["General", "Support", "Partnership", "Press"] as const;
export type ContactSubject = (typeof contactSubjects)[number];

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  subject: z.enum(contactSubjects, { message: "Please select a subject" }),
  body: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});
