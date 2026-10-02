import { ApiResponse, ApiErrorResponse } from '@tebeya/shared';
import { CONFIG } from '../constants/config';
import { useAuthStore } from '../store/authStore';

export class ApiError extends Error {
  code: string;
  details?: unknown;
  status: number;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  const url = `${CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network connection failed';
    throw new ApiError(msg, 'NETWORK_ERROR', 0);
  }

  // Handle Token Expiry (401)
  if (response.status === 401 && requiresAuth) {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = (await refreshRes.json()) as ApiResponse<{
            accessToken: string;
            refreshToken: string;
          }>;
          const user = useAuthStore.getState().user;
          if (user) {
            await useAuthStore.getState().setSession(user, refreshData.data);
            // Retry initial request with new access token
            requestHeaders['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
            response = await fetch(url, {
              ...restOptions,
              headers: requestHeaders,
            });
          }
        } else {
          await useAuthStore.getState().logout();
        }
      } catch {
        await useAuthStore.getState().logout();
      }
    } else {
      await useAuthStore.getState().logout();
    }
  }

  let jsonResult: unknown;
  try {
    jsonResult = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        `Server returned ${response.status} ${response.statusText}`,
        'SERVER_ERROR',
        response.status
      );
    }
    return {} as T;
  }

  if (!response.ok) {
    const errData = jsonResult as ApiErrorResponse;
    const errCode = errData.error?.code || 'UNKNOWN_ERROR';
    const errMsg = errData.error?.message || 'An unexpected error occurred';
    throw new ApiError(errMsg, errCode, response.status, errData.error?.details);
  }

  const successData = jsonResult as ApiResponse<T>;
  return successData.data;
}
