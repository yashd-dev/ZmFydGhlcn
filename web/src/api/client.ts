export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/u, "");

export const getJson = async <T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<T> => {
  const search = new URLSearchParams(params);
  const url = `${baseUrl}${path}?${search}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    let message = "The Wind Intelligence API could not complete this request.";
    try {
      const body = (await response.json()) as {
        detail?: string | { message?: string };
      };
      message =
        typeof body.detail === "string"
          ? body.detail
          : (body.detail?.message ?? message);
    } catch {
      /* safe fallback */
    }
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
};
