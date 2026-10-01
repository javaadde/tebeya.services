import type { ApiResponse, ApiErrorResponse } from '@tebeya/shared';
import {
  mockEvents,
  mockStaff,
  mockInvites,
  mockRosters,
  mockWageRule,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// In-memory mock storage for offline/demo operation
const runtimeEvents = [...mockEvents];
const runtimeStaff = [...mockStaff];
const runtimeInvites = [...mockInvites];
const runtimeRosters = { ...mockRosters };
let runtimeWageRule = { ...mockWageRule };

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers: customHeaders, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = localStorage.getItem('tb_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers,
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      if (!endpoint.includes('/auth/login')) {
        localStorage.removeItem('tb_access_token');
        localStorage.removeItem('tb_user');
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(`HTTP error ${response.status}`, `HTTP_${response.status}`);
      }
      return (await response.text()) as unknown as T;
    }

    const json = await response.json();

    if (!response.ok) {
      const errorResponse = json as ApiErrorResponse;
      throw new ApiError(
        errorResponse.error?.message || 'An unexpected error occurred',
        errorResponse.error?.code || `HTTP_${response.status}`,
        errorResponse.error?.details
      );
    }

    const successResponse = json as ApiResponse<T>;
    return successResponse.data;
  } catch (error) {
    // If real backend throws a handled business error, re-throw it
    if (error instanceof ApiError && error.code !== 'NETWORK_ERROR') {
      throw error;
    }

    // Graceful offline mock fallback
    return handleMockFallback<T>(endpoint, options);
  }
}

function handleMockFallback<T>(endpoint: string, options: RequestOptions): T {
  const method = (options.method || 'GET').toUpperCase();

  // 1. Auth endpoints
  if (endpoint.includes('/auth/login')) {
    const mockAdmin = {
      id: 'usr_admin_master',
      name: 'Operations Dispatcher',
      email: 'admin@tebeya.services',
      phone: '+91 98470 00001',
      phoneVerified: true,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      user: mockAdmin,
      tokens: {
        accessToken: 'mock_demo_token',
        refreshToken: 'mock_demo_refresh',
      },
    } as unknown as T;
  }

  if (endpoint.includes('/users/me')) {
    return {
      id: 'usr_admin_master',
      name: 'Operations Dispatcher',
      email: 'admin@tebeya.services',
      phone: '+91 98470 00001',
      phoneVerified: true,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as T;
  }

  // 2. Events endpoints
  if (endpoint === '/events' && method === 'GET') {
    return runtimeEvents as unknown as T;
  }

  if (endpoint.startsWith('/events/') && method === 'GET') {
    const id = endpoint.split('/')[2];
    const found = runtimeEvents.find((e) => e.id === id) || runtimeEvents[0];
    return found as unknown as T;
  }

  if (endpoint === '/admin/events' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const newEvent = {
      id: `evt_${Date.now()}`,
      filledCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body,
    };
    runtimeEvents.unshift(newEvent);
    return newEvent as unknown as T;
  }

  if (endpoint.includes('/publish') && method === 'POST') {
    const id = endpoint.split('/')[3];
    const evt = runtimeEvents.find((e) => e.id === id);
    if (evt) evt.status = 'published';
    return evt as unknown as T;
  }

  if (endpoint.includes('/cancel') && method === 'POST') {
    const id = endpoint.split('/')[3];
    const evt = runtimeEvents.find((e) => e.id === id);
    if (evt) evt.status = 'cancelled';
    return evt as unknown as T;
  }

  // 3. Roster endpoints
  if (endpoint.includes('/roster') && !endpoint.includes('/attendance') && method === 'GET') {
    const parts = endpoint.split('/');
    const eventId = parts[3];
    const rosterData = runtimeRosters[eventId] || {
      eventId,
      headcount: 20,
      filledCount: 0,
      waitlistCount: 0,
      roster: [],
    };
    return rosterData as unknown as T;
  }

  if (endpoint.includes('/roster/attendance') && method === 'PATCH') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return { updatedCount: body.attendees?.length || 1 } as unknown as T;
  }

  // 4. Staff endpoints
  if (endpoint === '/admin/users' && method === 'GET') {
    const statusParam = options.params?.status;
    const searchParam = options.params?.search ? String(options.params.search).toLowerCase() : '';
    let filtered = [...runtimeStaff];
    if (statusParam) {
      filtered = filtered.filter((s) => s.status === statusParam);
    }
    if (searchParam) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchParam) ||
          s.email.toLowerCase().includes(searchParam) ||
          s.phone.includes(searchParam)
      );
    }
    return filtered as unknown as T;
  }

  if (endpoint.includes('/admin/users/') && endpoint.includes('/status') && method === 'PATCH') {
    const parts = endpoint.split('/');
    const id = parts[3];
    const body = options.body ? JSON.parse(options.body as string) : {};
    const staff = runtimeStaff.find((s) => s.id === id);
    if (staff) {
      if (body.status) staff.status = body.status;
      if (body.phoneVerified !== undefined) staff.phoneVerified = body.phoneVerified;
    }
    return staff as unknown as T;
  }

  // 5. Invite codes
  if (endpoint === '/admin/invite-codes' && method === 'GET') {
    const statusParam = options.params?.status;
    if (statusParam && statusParam !== 'all') {
      return runtimeInvites.filter((i) => i.status === statusParam) as unknown as T;
    }
    return runtimeInvites as unknown as T;
  }

  if (endpoint === '/admin/invite-codes' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const count = body.count || 1;
    const newCodes = [];
    for (let i = 0; i < count; i++) {
      const code = {
        id: `inv_${Date.now()}_${i}`,
        code: `TEB-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + i)}`,
        createdBy: 'usr_admin',
        lockedPhoneOrEmail: body.lockedPhoneOrEmail,
        status: 'active' as const,
        expiresAt: new Date(Date.now() + (body.expiresInHours || 48) * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      runtimeInvites.unshift(code);
      newCodes.push(code);
    }
    return newCodes as unknown as T;
  }

  if (endpoint.includes('/revoke') && method === 'POST') {
    const id = endpoint.split('/')[3];
    const item = runtimeInvites.find((i) => i.id === id);
    if (item) item.status = 'revoked';
    return item as unknown as T;
  }

  // 6. Wage rules & payments
  if (endpoint === '/admin/payments/wage-rules' && method === 'GET') {
    return runtimeWageRule as unknown as T;
  }

  if (endpoint === '/admin/payments/wage-rules' && method === 'PUT') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    runtimeWageRule = { ...runtimeWageRule, ...body, updatedAt: new Date().toISOString() };
    return runtimeWageRule as unknown as T;
  }

  if (endpoint === '/admin/payments/mark-paid' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return { markedCount: body.bookingIds?.length || 1 } as unknown as T;
  }

  return {} as unknown as T;
}
