import { supabase } from '../../services/supabase.js';
import { setSession } from '../sessions.js';

export async function handleStart(ctx) {
  const eventCode = ctx.startPayload;
  const telegramId = String(ctx.from.id);
  const name = ctx.from.first_name;

  if (eventCode) {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('code', eventCode.toUpperCase())
      .single();

    if (!event) {
      return ctx.reply("That event code doesn't exist. Ask the organizer for the correct invitation link!");
    }

    const { data: attendee } = await supabase.from('attendees').upsert(
      { event_id: event.id, telegram_chat_id: telegramId, name, status: 'joined' },
      { onConflict: 'telegram_chat_id,event_id' }
    ).select().single();

    if (attendee) setSession(telegramId, attendee.id);

    return ctx.reply(
      `Hey ${name}! You're all set for *${event.name}*.\n\nYour mission: capture one candid moment that tells the story of this gathering.\n\nNow send your photo with a caption describing what you captured — a word, a feeling, or a sentence. That becomes part of your story in the storybook.\n\n_Example: "Grandma laughing at dad's joke" or "the quiet moment before the cake"_`,
      { parse_mode: 'Markdown' }
    );
  }

  ctx.reply(
    `Welcome to CandidMoments!\n\nI help turn gatherings into shared storybooks.\n\nIf you have an event code, type it here or use the invitation link from your organizer.`
  );
}
