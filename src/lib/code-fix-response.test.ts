import assert from "node:assert/strict";
import test from "node:test";
import { extractResponseText } from "./code-fix-response.ts";

test("extracts the Responses API output_text shortcut", () => {
  assert.equal(extractResponseText({ output_text: "  Fixed code  " }), "Fixed code");
});

test("extracts text blocks from message output", () => {
  assert.equal(
    extractResponseText({
      output: [
        {
          type: "message",
          content: [
            { type: "reasoning", text: "not shown" },
            { type: "output_text", text: "Corrected code" },
            { type: "output_text", text: "Bug explanation" },
          ],
        },
      ],
    }),
    "Corrected code\nBug explanation",
  );
});

test("returns empty text for malformed responses", () => {
  assert.equal(extractResponseText(null), "");
  assert.equal(extractResponseText({ output: [] }), "");
});
