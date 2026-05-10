import { Event, MegaStorybook, Storybook } from './api';

const MOCK_EVENTS: Event[] = [
  {
    id: 'mock-1',
    name: "Mom's Birthday Brunch",
    description: 'A surprise brunch for her 60th!',
    event_date: '2026-05-10',
    code: 'MOM60X',
    status: 'active',
    created_at: '2026-05-10T09:00:00Z',
    attendees: [
      { id: 'a1', name: 'Sarah', status: 'submitted', telegram_chat_id: '111' },
      { id: 'a2', name: 'Jake', status: 'submitted', telegram_chat_id: '222' },
      { id: 'a3', name: 'Lily', status: 'joined', telegram_chat_id: '333' },
    ],
    photos: [
      { id: 'p1', cloudinary_url: 'https://picsum.photos/seed/brunch1/600/450', created_at: '2026-05-10T10:30:00Z' },
      { id: 'p2', cloudinary_url: 'https://picsum.photos/seed/brunch2/600/450', created_at: '2026-05-10T11:00:00Z' },
      { id: 'p3', cloudinary_url: 'https://picsum.photos/seed/brunch3/600/450', created_at: '2026-05-10T11:20:00Z' },
      { id: 'p4', cloudinary_url: 'https://picsum.photos/seed/brunch4/600/450', created_at: '2026-05-10T12:00:00Z' },
    ],
  },
  {
    id: 'mock-2',
    name: "Grandpa's 85th",
    description: 'Reunion at the lake house.',
    event_date: '2026-04-20',
    code: 'GP85TH',
    status: 'active',
    created_at: '2026-04-20T14:00:00Z',
    attendees: [
      { id: 'a4', name: 'Tom', status: 'submitted', telegram_chat_id: '444' },
      { id: 'a5', name: 'Diana', status: 'submitted', telegram_chat_id: '555' },
    ],
    photos: [
      { id: 'p5', cloudinary_url: 'https://picsum.photos/seed/lake1/600/450', created_at: '2026-04-20T15:00:00Z' },
      { id: 'p6', cloudinary_url: 'https://picsum.photos/seed/lake2/600/450', created_at: '2026-04-20T15:30:00Z' },
    ],
  },
];

const MOCK_STORYBOOK: Storybook = {
  id: 'sb-1',
  event_id: 'mock-1',
  title: "A Morning Worth Remembering",
  summary: "Some moments don't need a reason to be perfect — they just are.",
  status: 'complete',
  generated_at: '2026-05-10T13:00:00Z',
  narrative: {
    title: "A Morning Worth Remembering",
    pages: [
      {
        photo_url: 'https://picsum.photos/seed/brunch1/800/600',
        contributor: 'Sarah',
        caption: "The table was set before anyone arrived — flowers from the garden, her favourite china. Sarah slipped in early to make sure everything was exactly right, the way only a daughter knows how.",
      },
      {
        photo_url: 'https://picsum.photos/seed/brunch2/800/600',
        contributor: 'Jake',
        caption: "Jake caught the moment she walked in. Sixty years old, and she still looked genuinely surprised — hands to her mouth, eyes bright. Some people never lose that gift.",
      },
      {
        photo_url: 'https://picsum.photos/seed/brunch3/800/600',
        contributor: 'Sarah',
        caption: "Three generations around one table. The youngest was more interested in the fruit bowl than the occasion, which felt just right — life carrying on, unconcerned with milestones.",
      },
      {
        photo_url: 'https://picsum.photos/seed/brunch4/800/600',
        contributor: 'Jake',
        caption: "By the time the cake came out, nobody was in a hurry to leave. The afternoon stretched long and easy, the way good Sundays do.",
      },
    ],
    closing: "Some moments don't need a reason to be perfect — they just are. This one will live in the family archive long after the flowers have wilted and the plates are put away. Happy birthday.",
  },
};

let nextId = 3;

const MOCK_MEGA: MegaStorybook = {
  title: "A Year of Gatherings",
  sections: [
    {
      event_name: "Mom's Birthday Brunch",
      event_date: '2026-05-10',
      pages: [
        { photo_url: 'https://picsum.photos/seed/brunch1/800/600', contributor: 'Sarah', caption: "The table was set before anyone arrived — flowers from the garden, her favourite china. Sarah slipped in early to make sure everything was exactly right." },
        { photo_url: 'https://picsum.photos/seed/brunch2/800/600', contributor: 'Jake', caption: "Jake caught the moment she walked in. Sixty years old and she still looked genuinely surprised — hands to her mouth, eyes bright." },
      ],
    },
    {
      event_name: "Grandpa's 85th",
      event_date: '2026-04-20',
      pages: [
        { photo_url: 'https://picsum.photos/seed/lake1/800/600', contributor: 'Tom', caption: "The lake was calm that morning, and so was he. Eighty-five years of life reflected in quiet eyes watching the water." },
        { photo_url: 'https://picsum.photos/seed/lake2/800/600', contributor: 'Diana', caption: "Laughter erupted when someone finally got the fishing rod untangled. These are the moments that become family legend." },
      ],
    },
  ],
  closing: "From birthday brunches to lakeside reunions, these moments are the threads that weave a family together. What a year of love it has been.",
};

export const api = {
  events: {
    list: async (): Promise<Event[]> => {
      await delay(400);
      return MOCK_EVENTS;
    },
    get: async (id: string): Promise<Event> => {
      await delay(300);
      const event = MOCK_EVENTS.find(e => e.id === id);
      if (!event) throw new Error('Not found');
      return event;
    },
    create: async (body: { name: string; description: string; event_date: string }): Promise<Event> => {
      await delay(600);
      const newEvent: Event = {
        id: `mock-${nextId++}`,
        name: body.name,
        description: body.description,
        event_date: body.event_date,
        code: Math.random().toString(36).slice(2, 8).toUpperCase(),
        status: 'active',
        created_at: new Date().toISOString(),
        attendees: [],
        photos: [],
      };
      MOCK_EVENTS.unshift(newEvent);
      return newEvent;
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      await delay(300);
      const i = MOCK_EVENTS.findIndex(e => e.id === id);
      if (i !== -1) MOCK_EVENTS.splice(i, 1);
      return { success: true };
    },
  },
  storybooks: {
    get: async (eventId: string): Promise<Storybook> => {
      await delay(300);
      if (eventId === 'mock-1') return MOCK_STORYBOOK;
      throw new Error('No storybook yet');
    },
    generate: async (eventId: string): Promise<{ message: string }> => {
      await delay(500);
      return { message: 'Storybook generation started', event_id: eventId } as any;
    },
    mega: async (_eventIds: string[]): Promise<MegaStorybook> => {
      await delay(1500);
      return MOCK_MEGA;
    },
  },
  contributor: {
    events: async (_telegramId: string): Promise<Event[]> => {
      await delay(400);
      return MOCK_EVENTS;
    },
  },
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
