// parseNestedJson.ts

/**
 * Recursively parses any stringified JSON fields in an object.
 * Returns a new object with all nested JSON strings parsed.
 */
export function parseNestedJson<T>(input: T): T {
  if (typeof input === "string") {
    try {
      // Try to parse the string as JSON
      const parsed = JSON.parse(input);
      // Recursively parse the result in case of deeply nested stringified JSON
      return parseNestedJson(parsed) as T;
    } catch {
      // Not a JSON string, return as is
      return input;
    }
  } else if (Array.isArray(input)) {
    // Recursively parse each element in the array
    return input.map((item) => parseNestedJson(item)) as T;
  } else if (typeof input === "object" && input !== null) {
    // Recursively parse each property in the object
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = parseNestedJson(value);
    }
    return result as T;
  }
  // For numbers, booleans, null, undefined, etc.
  return input;
}
