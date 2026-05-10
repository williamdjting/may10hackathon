import { Router } from 'express';
import { supabase } from '../../services/supabase.js';
import { generateStorybook } from '../../services/storybook.js';

const router = Router();

router.get('/event/:eventId', async (req, res) => {
  const { data, error } = await supabase
    .from('storybooks')
    .select('*')
    .eq('event_id', req.params.eventId)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'No storybook yet' });
  res.json(data);
});

router.post('/generate/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { prompt = '' } = req.body;

  await supabase.from('storybooks').upsert(
    { event_id: eventId, status: 'generating' },
    { onConflict: 'event_id' }
  );

  generateStorybook(eventId, prompt).catch(console.error);

  res.json({ message: 'Storybook generation started', event_id: eventId });
});

export default router;
