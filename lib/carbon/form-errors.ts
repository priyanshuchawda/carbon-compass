import type { ZodIssue } from "zod";

export type FormErrors = Record<string, string>;

export function zodIssuesToFieldErrors(issues: readonly ZodIssue[]): FormErrors {
  return issues.reduce<FormErrors>((errors, issue) => {
    const fieldName = String(issue.path.at(-1) ?? "form");
    errors[fieldName] = issue.message;
    return errors;
  }, {});
}

export function focusFirstIssueField(issues: readonly ZodIssue[]): void {
  const firstFieldName = issues[0]?.path.at(-1);

  if (!firstFieldName || typeof document === "undefined") {
    return;
  }

  const field = document.getElementById(String(firstFieldName));
  field?.scrollIntoView({ behavior: "smooth", block: "center" });
  field?.focus();
}
