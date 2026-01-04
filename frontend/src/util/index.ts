/**
 * In development, Vite proxy may return HTTP 500 with an empty body
 * when the backend is down. Calling res.json() then throws.
 * This function safely parses JSON and normalizes errors.
 */
export async function safeParseJson<T = unknown>(res: Response): Promise<T> {
  let result: unknown;

  if (!res.ok) {
    try {
      result = await res.json();
    } catch {
      // the backend is down and vite proxy has returned status code 500
      throw new Error("Server error");
    }

    // the backend is up and it returned a valid error json in response eg status codes 500, 400, 404
    if (
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof (result as any).message === "string"
    ) {
      throw new Error((result as any).message);
    }

    // Fallback if no message exists in "result" object ie if above conditional fails
    throw new Error("Request failed");
  }

  // success case
  return (await res.json()) as T;
}
