import { supabase } from '../../services/supabase.js';

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

    await supabase.from('attendees').upsert(
      { event_id: event.id, telegram_chat_id: telegramId, name, status: 'joined' },
      { onConflict: 'telegram_chat_id,event_id' }
    );

    return ctx.reply(
      `Hey ${name}! You're all set for *${event.name}*.\n\n` +
      `Your mission: capture one candid moment that tells the story of this gathering.\n\n` +
      `When you're ready, just send your photo here and I'll take care of the rest!`,
      { parse_mode: 'Markdown' }
    );
  }

  ctx.reply(
    `Welcome to CandidMoments!\n\n` +
    `I help turn gatherings into shared storybooks.\n\n` +
    `If you have an event code, type it here or use the invitation link from your organizer.`
  );
}
