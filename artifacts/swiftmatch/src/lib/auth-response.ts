/** Read the body once so invalid/empty responses never escape as JSON syntax errors. */
export async function parseAuthResponse(response: Response): Promise<Record<string, any>> {
  const fallback = response.ok
    ? "The server returned an empty or invalid response. Please try signing in to check whether your account was created."
    : `Request failed (HTTP ${response.status}). Please try again.`;
  if (response.status === 204) throw new Error(fallback);

  const rawText = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    console.error("Unable to parse authentication response", {
      status: response.status,
      rawResponse: rawText,
    });
    throw new Error(fallback);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(fallback);
  }
  const result = data as Record<string, any>;
  if (!response.ok || result.success === false || typeof result.error === "string") {
    throw new Error(typeof result.error === "string" ? result.error : fallback);
  }
  return result;
}