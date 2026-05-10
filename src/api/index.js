import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';
import storybooksRouter from './routes/storybooks.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api/events', eventsRouter);
app.use('/api/storybooks', storybooksRouter);
