import assert from "node:assert/strict";
import { test } from "node:test";
import { customFetch, ApiError } from "./custom-fetch.ts";

test("collection responses fall back to arrays without changing other contracts", async () => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = message => warnings.push(message);
  try {
    const paths = [
      "/api/jobs", "/api/jobs?search=test", "/api/assessments",
      "/api/applicants", "/api/courses", "/api/skills/suggestions",
      "/api/jobs/applications/me", "/api/jobs/1/applications",
      "/api/applicants/1/assessment-results", "/api/assessments/applicant/1/results",
      "https://example.test/swiftmatch/api/jobs/",
    ];
    for (const payload of [null, {}, { error: "unexpected" }, "text", 42, false]) {
      globalThis.fetch = async () => Response.json(payload);
      for (const path of paths) {
        const data = await customFetch(path);
        assert.deepEqual(data, []);
        assert.doesNotThrow(() => data.filter(Boolean).map(x => x).reduce((n) => n + 1, 0));
      }
    }
    for (const status of [204, 205]) {
      globalThis.fetch = async () => new Response(null, { status });
      assert.deepEqual(await customFetch("/api/jobs"), []);
    }
    globalThis.fetch = async () => Response.json([{ id: 1 }]);
    assert.deepEqual(await customFetch("/api/jobs"), [{ id: 1 }]);
    globalThis.fetch = async () => Response.json({ id: 1 });
    assert.deepEqual(await customFetch("/api/jobs/1"), { id: 1 });
    assert.deepEqual(await customFetch("/api/jobs", { method: "POST" }), { id: 1 });
    for (const status of [401, 403, 500]) {
      globalThis.fetch = async () => Response.json({ error: "Denied" }, { status });
      await assert.rejects(customFetch("/api/jobs"), error => error instanceof ApiError && error.status === status);
    }
    assert.ok(warnings.length > 0);
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  }
});