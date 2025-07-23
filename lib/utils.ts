import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names using clsx and tailwind-merge.
 * @param inputs - Array of class names to merge.
 * @returns Merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ApiError = {
  status: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any; // Using any here to allow for flexible error data structures
};

type Result<T, E = ApiError> = { data: T; error: null } | { data: null; error: E };

/**
 * Wraps a promise in a try-catch block and returns a Result object.
 * @param promise - The promise to execute.
 * @returns A Result object containing either the data or an error.
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

/**
 * Fetches data from an API endpoint.
 * @param endpoint - The API endpoint to fetch from.
 * @param options - Optional fetch options, including query parameters.
 * @returns A Result object containing either the data or an ApiError.
 */
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Result<T, ApiError>> {
  const { params, ...fetchOptions } = options;
  let url = endpoint;

  // Add query params if they exist
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    url += `?${searchParams.toString()}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          status: response.status,
          message: data.error || "An error occurred",
          data: data,
        },
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        status: 500,
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
}

/**
 * Formats a date into a localized string.
 * @param date - The date to format (can be a Date object or a string).
 * @returns A string representing the formatted date and time.
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}
