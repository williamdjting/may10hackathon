import axios from 'axios';
import { supabase } from '../../services/supabase.js';
import { uploadToCloudinary } from '../../services/cloudinary.js';

export async function handlePhoto(ctx) {
  const telegramId = String(ctx.from.id);

  const { data: attendees } = await supabase
    .from('attendees')
    .select('*, events(*)')
    .eq('telegram_chat_id', telegramId)
    .in('status', ['joined', 'submitted'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (!attendees?.length) {
    return ctx.reply("You're not registered for an event yet. Use the invitation link to join one!");
  }

  const attendee = attendees[0];
  await ctx.reply('Uploading your photo...');

  try {
    const photoSizes = ctx.message.photo;
    const largest = photoSizes[photoSizes.length - 1];
    const fileLink = await ctx.telegram.getFileLink(largest.file_id);

    const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    const result = await uploadToCloudinary(buffer, {
      folder: `candid-moments/${attendee.event_id}`,
      public_id: `${attendee.id}_${Date.now()}`,
    });

    await supabase.from('photos').insert({
      event_id: attendee.event_id,
      attendee_id: attendee.id,
      cloudinary_url: result.secure_url,
      cloudinary_public_id: result.public_id,
      user_caption: ctx.message.caption ?? null,
    });

    await supabase
      .from('attendees')
      .update({ status: 'submitted' })
      .eq('id', attendee.id);

    await ctx.reply(
      `Your moment has been saved for *${attendee.events.name}*!\n\nThe storybook will be ready after the event. Stay tuned!`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('Photo upload error:', err);
    await ctx.reply('Something went wrong uploading your photo. Please try again!');
  }
}
