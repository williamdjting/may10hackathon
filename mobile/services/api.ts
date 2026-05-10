import * as mockApi from './mockApi';

declare const process: { env: Record<string, string | undefined> };

const USE_MOCK = process.env.EXPO_PUBLIC_MOCK === 'true';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export type Event = {
  id: string;
  name: string;
  description: string;
  event_date: string;
  code: string;
  status: string;
  created_at: string;
  attendees?: Attendee[];
  photos?: Photo[];
};

export type Attendee = {
  id: string;
  name: string;
  status: string;
  telegram_chat_id: string;
};

export type Photo = {
  id: string;
  cloudinary_url: string;
  created_at: string;
};

export type Storybook = {
  id: string;
  event_id: string;
  title: string;
  summary: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  generated_at: string;
  narrative: {
    title: string;
    pages: { photo_url: string; contributor: string; caption: string }[];
    closing: string;
  };
};

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

const realApi = {
  events: {
    list: () => request<Event[]>(`/api/events/user/${DEMO_USER_ID}`),
    get: (id: string) => request<Event>(`/api/events/${id}`),
    create: (body: { name: string; description: string; event_date: string }) =>
      request<Event>('/api/events', {
        method: 'POST',
        body: JSON.stringify({ ...body, creator_id: DEMO_USER_ID }),
      }),
  },
  storybooks: {
    get: (eventId: string) => request<Storybook>(`/api/storybooks/event/${eventId}`),
    generate: (eventId: string, prompt = '') =>
      request<{ message: string }>(`/api/storybooks/generate/${eventId}`, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }),
  },
};

export const api = USE_MOCK ? mockApi.api : realApi;
