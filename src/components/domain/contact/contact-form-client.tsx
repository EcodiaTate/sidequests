"use client";

import { useActionState, useEffect, useRef } from "react";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { submitContactForm } from "@/lib/actions/contact";
import type { ContactResult } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { contactSubjects } from "@/lib/validations/contact";

export function ContactFormClient() {
  const haptic = useHaptic();
  const [state, formAction, isPending] = useActionState<ContactResult | null, FormData>(
    submitContactForm,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if ("success" in state) {
      haptic.notify("success");
    } else if ("error" in state) {
      haptic.notify("error");
    }
  }, [state, haptic]);

  const isSuccess = state && "success" in state;
  const isError = state && "error" in state;

  if (isSuccess) {
    return (
      <Alert variant="success">{state.message}</Alert>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => haptic.impact("medium")}
      className="flex flex-col gap-3"
    >
      {isError && <Alert variant="error">{state.error}</Alert>}

      <Input
        type="text"
        name="name"
        placeholder="Your name"
        autoComplete="name"
        required
        minLength={2}
        maxLength={100}
      />

      <Input
        type="email"
        name="email"
        placeholder="Email address"
        autoComplete="email"
        required
      />

      <div className="flex flex-col gap-1">
        <select
          name="subject"
          required
          defaultValue=""
          className="input"
        >
          <option value="" disabled>
            Select a subject
          </option>
          {contactSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        name="body"
        placeholder="Your message"
        required
        minLength={10}
        maxLength={5000}
        rows={5}
      />

      <Button
        variant="primary"
        type="submit"
        fullWidth
        disabled={isPending}
        loading={isPending}
      >
        Send message
      </Button>
    </form>
  );
}
