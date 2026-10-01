export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  events: {
    all: ['events'] as const,
    list: (filters?: Record<string, unknown>) => ['events', 'list', filters ?? {}] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
    roster: (id: string) => ['events', 'roster', id] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (filters?: Record<string, unknown>) => ['staff', 'list', filters ?? {}] as const,
    detail: (id: string) => ['staff', 'detail', id] as const,
  },
  invites: {
    all: ['invites'] as const,
    list: (status?: string) => ['invites', 'list', status ?? 'all'] as const,
  },
  wages: {
    rule: ['wages', 'rule'] as const,
  },
};
