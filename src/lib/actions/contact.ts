"use server";

import { contactFormSchema } from "@/lib/validations/contact";

export type ContactResult = { error: string } | { success: true; message: string };

export async function submitContactForm(
  _prevState: ContactResult | null,
  formData: FormData
): Promise<ContactResult> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // TODO: Send email via Resend or log to Supabase table
  console.log("[Contact Form]", parsed.data);

  return { success: true, message: "Thanks for reaching out! We'll get back to you soon." };
}
