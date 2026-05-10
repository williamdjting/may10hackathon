import { supabase } from '../../services/supabase.js';

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
      await supabase.from('attendees').upsert(
        { event_id: event.id, telegram_chat_id: telegramId, name, status: 'joined' },
        { onConflict: 'telegram_chat_id,event_id' }
      );

      return ctx.reply(
        `You're in for *${event.name}*!\n\nCapture your moment and send me the photo when you're ready.`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  ctx.reply("Send me a photo to contribute to your event, or use your invitation link to join one.");
}
