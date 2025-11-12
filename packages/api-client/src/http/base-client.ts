import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { z } from "zod";
import { ApiError, normalizeErrorMessage } from "./errors";
import type { AuthApiErrorPayload } from "../types";

// Environment variable names to check (in order of priority)
const ENV_VAR_CANDIDATES = [
  "NEXT_PUBLIC_APIs_URL_LOCAL",
  "NEXT_PUBLIC_APIs_URL_HOST_VPS",
] as const;

export interface RequestConfig<TBody, TResponse> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: TBody;
  headers?: Record<string, string>;
  bodySchema?: z.ZodSchema<TBody>;
  responseSchema?: z.ZodSchema<TResponse>;
  baseURL?: string;
  fallbackErrorMessage?: string;
}

interface ResolvedBaseUrl {
  url: string;
  source: "parameter" | "env";
  envVar?: string;
}

function readEnv(name: string): string | undefined {
  // Server-side: read from process.env
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[name];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function resolveBaseUrl(baseURL?: string): ResolvedBaseUrl {
  // If baseURL is provided as parameter, use it
  if (baseURL && baseURL.trim().length > 0) {
    return {
      url: baseURL.replace(/\/+$/, ""),
      source: "parameter",
    };
  }

  // Try to read from environment variables
  for (const envVar of ENV_VAR_CANDIDATES) {
    const value = readEnv(envVar);
    if (value && value.trim().length > 0) {
      return {
        url: value.replace(/\/+$/, ""),
        source: "env",
        envVar,
      };
    }
  }

  // No baseURL found - throw error instead of using default
  const envVarList = ENV_VAR_CANDIDATES.join(", ");
  throw new Error(
    `API base URL is not configured. Please set one of the following environment variables: ${envVarList}. ` +
      `The API service is currently unavailable.`,
  );
}

// Cache instances by baseURL
const instanceCache = new Map<string, AxiosInstance>();

function getAxiosInstance(baseURL?: string): AxiosInstance {
  const resolved = resolveBaseUrl(baseURL);

  // Log resolved URL and source (only in development)
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
    if (resolved.source === "env") {
      console.log(
        `[API Client] Using baseURL from env: ${resolved.url} (${resolved.envVar})`,
      );
    } else if (resolved.source === "parameter") {
      console.log(`[API Client] Using baseURL from parameter: ${resolved.url}`);
    }
  }

  if (!instanceCache.has(resolved.url)) {
    const instance = axios.create({
      baseURL: resolved.url,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    instance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error),
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const errorPayload =
            (error.response.data as AuthApiErrorPayload | null | undefined) ?? undefined;
          const errorMessage = normalizeErrorMessage(
            errorPayload ?? null,
            error instanceof Error ? error.message : "Request failed",
          );
          return Promise.reject(
            new ApiError(errorMessage, error.response.status, errorPayload),
          );
        }

        if (error.request) {
          return Promise.reject(
            new ApiError("Network error. Please check your connection.", 0),
          );
        }

        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred";
        return Promise.reject(new ApiError(errorMessage, 0));
      },
    );

    instanceCache.set(resolved.url, instance);
  }

  return instanceCache.get(resolved.url)!;
}

export async function request<TBody, TResponse>({
  url,
  method = "GET",
  body,
  headers = {},
  bodySchema,
  responseSchema,
  baseURL,
  fallbackErrorMessage = "Request failed",
}: RequestConfig<TBody, TResponse>): Promise<TResponse> {
  if (body && bodySchema) {
    bodySchema.parse(body);
  }

  let instance: AxiosInstance;
  try {
    instance = getAxiosInstance(baseURL);
  } catch (error) {
    // If baseURL is not configured, throw ApiError with maintenance message
    if (error instanceof Error && error.message.includes("API base URL is not configured")) {
      throw new ApiError(
        "API service is currently unavailable. Please contact support or try again later.",
        503, // Service Unavailable
      );
    }
    throw error;
  }
  
  // Ensure URL starts with / and doesn't have double slashes
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;

  const config: AxiosRequestConfig = {
    method,
    url: normalizedUrl,
    headers,
    data: body,
  };

  // Debug logging (only in development)
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
    const fullUrl = `${instance.defaults.baseURL}${normalizedUrl}`;
    console.log(`[API Client] ${method} ${fullUrl}`);
    // Additional validation: check if baseURL contains /docs
    if (instance.defaults.baseURL?.includes("/docs")) {
      console.error(
        `[API Client] ⚠️  WARNING: baseURL contains '/docs': ${instance.defaults.baseURL}`,
      );
      console.error(
        `[API Client] This is likely incorrect. Check your environment variables.`,
      );
    }
  }

  try {
    const response: AxiosResponse<TResponse> = await instance.request(config);

    if (responseSchema) {
      return responseSchema.parse(response.data) as TResponse;
    }

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : fallbackErrorMessage;

    throw new ApiError(
      message,
      0,
      error instanceof Error ? { error: error.message } : undefined,
    );
  }
}
