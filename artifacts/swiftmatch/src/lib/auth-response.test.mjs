import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAuthResponse } from "./auth-response.ts";

test("auth parsing preserves JSON contracts and handles empty and non-JSON responses", async () => {
  const originalError = console.error;
  const logs = [];
  console.error = (...args) => logs.push(args);
  try {
    for (const confirmed of [true, false]) {
      const body = { success: true, confirmed, message: "Created" };
      assert.deepEqual(await parseAuthResponse(Response.json(body, { status: 201 })), body);
    }
    await assert.rejects(parseAuthResponse(Response.json({ error: "Already registered" }, { status: 409 })), /Already registered/);
    for (const status of [200, 201, 400, 500]) {
      for (const body of ["", "<html>Unavailable</html>", "{"]) {
        await assert.rejects(parseAuthResponse(new Response(body, { status })), error => error instanceof Error && !(error instanceof SyntaxError));
      }
    }
    await assert.rejects(parseAuthResponse(new Response(null, { status: 204 })), /empty or invalid/);
    for (const body of [null, [], "invalid"]) {
      await assert.rejects(parseAuthResponse(Response.json(body)), /empty or invalid/);
    }
    assert.ok(logs.some(([, detail]) => detail.rawResponse === "<html>Unavailable</html>"));
  } finally {
    console.error = originalError;
  }
});