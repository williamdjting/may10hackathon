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

export default router;
