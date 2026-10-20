import { createServerFn } from "@tanstack/react-start";
import type { CodeFixResult } from "@/lib/code-fix.server";

export const fixCode = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new Error("Invalid code-fix request.");
    }
    const code = (input as Record<string, unknown>).code;
    if (typeof code !== "string") throw new Error("Code must be text.");
    return code;
  })
  .handler(async ({ data }): Promise<CodeFixResult> => {
    const { fixCodeWithGrok } = await import("./code-fix.server");
    return fixCodeWithGrok(data);
  });
