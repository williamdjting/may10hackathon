import { supabase } from '../../services/supabase.js';
import { setSession } from '../sessions.js';

export async function handleMessage(ctx) {
  if (!ctx.message?.text) return;

  const text = ctx.message.text.trim().toUpperCase();
  const telegramId = String(ctx.from.id);

  // 6-character alphanumeric event code
  if (/^[A-Z0-9]{6}$/.test(text)) {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('code', text)
      .single();

    if (event) {
      const name = ctx.from.first_name;
      const { data: attendee } = await supabase.from('attendees').upsert(
        { event_id: event.id, telegram_chat_id: telegramId, name, status: 'joined' },
        { onConflict: 'telegram_chat_id,event_id' }
      ).select().single();

      if (attendee) setSession(telegramId, attendee.id);

      return ctx.reply(
        `You're in for *${event.name}*!\n\nNow send your photo with a caption describing what you captured — a word, a feeling, or a sentence. That becomes part of your story in the storybook.\n\n_Example: "Grandma laughing at dad's joke" or "the quiet moment before the cake"_`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  ctx.reply("Send me a photo to contribute to your event, or type your 6-digit event code to join one.");
}
