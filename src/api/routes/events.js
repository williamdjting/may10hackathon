import { Router } from 'express';
import { nanoid } from 'nanoid';
import { supabase } from '../../services/supabase.js';

const router = Router();

router.post('/', async (req, res) => {
  const { name, description, event_date, creator_id } = req.body;
  const code = nanoid(6).toUpperCase();

  const { data, error } = await supabase
    .from('events')
    .insert({ name, description, event_date, creator_id, code })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/all', async (_req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, photos(*), attendees(count)')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  const withPhotos = data.filter(e => e.photos?.length > 0);
  res.json(withPhotos);
});

// Events where a specific Telegram user contributed a photo
router.get('/contributed/:telegramId', async (req, res) => {
  const { data: attendees, error } = await supabase
    .from('attendees')
    .select('event_id')
    .eq('telegram_chat_id', req.params.telegramId)
    .eq('status', 'submitted');

  if (error) return res.status(400).json({ error: error.message });
  if (!attendees?.length) return res.json([]);

  const eventIds = attendees.map(a => a.event_id);

  const { data: events, error: evErr } = await supabase
    .from('events')
    .select('*, photos(*), attendees(count)')
    .in('id', eventIds)
    .order('created_at', { ascending: false });

  if (evErr) return res.status(400).json({ error: evErr.message });
  res.json(events ?? []);
});

router.get('/user/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, photos(count), attendees(count)')
    .eq('creator_id', req.params.userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, attendees(*), photos(*)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

export default router;
