import { supabase } from './supabase.js';
import { sendMessage } from './backboard.js';

export async function generateStorybook(eventId, customPrompt = '') {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('*, photos(*, attendees(name))')
      .eq('id', eventId)
      .single();

    if (!event?.photos?.length) {
      await upsertStorybook(eventId, { status: 'error', summary: 'No photos were submitted for this event.' });
      return;
    }

    const toneInstruction = customPrompt
      ? `The organizer has provided this guidance for the story: "${customPrompt}"\n\n`
      : '';

    const photoList = event.photos
      .map((p, i) => {
        const name = p.attendees?.name ?? 'a guest';
        const caption = p.user_caption
          ? `  Their caption: "${p.user_caption}"`
          : `  (no caption provided)`;
        return `Photo ${i + 1} by ${name}\n${caption}`;
      })
      .join('\n\n');

    const prompt =
      `You are writing a digital storybook for a gathering called "${event.name}".\n` +
      `Event description: ${event.description ?? 'A special gathering'}\n` +
      `Event date: ${event.event_date ?? 'Recently'}\n\n` +
      toneInstruction +
      `Each attendee contributed a photo and wrote a caption describing their moment. ` +
      `Your job is to expand each caption into 2–3 warm, narrative sentences suitable for a family keepsake. ` +
      `When a caption is provided, it is the photographer's own words — stay true to the feeling and details they described, ` +
      `and build on them rather than replacing them. ` +
      `When no caption is provided, write something warm and brief based on the contributor and the event.\n\n` +
      `Here are the photos:\n\n${photoList}\n\n` +
      `Then write a closing paragraph weaving all moments into one story.\n\n` +
      `Respond with ONLY valid JSON:\n` +
      `{\n` +
      `  "title": "storybook title",\n` +
      `  "pages": [\n` +
      event.photos.map(p => `    { "photo_url": "${p.cloudinary_url}", "contributor": "${p.attendees?.name ?? 'a guest'}", "caption": "..." }`).join(',\n') + '\n' +
      `  ],\n` +
      `  "closing": "closing narrative"\n` +
      `}`;

    const first = await sendMessage({ content: prompt, memory: 'Auto' });

    const parsed = extractJSON(first.content);
    if (!parsed) {
      const retry = await sendMessage({
        content: 'Please respond with only the JSON object, no surrounding text.',
        threadId: first.threadId,
      });
      const retryParsed = extractJSON(retry.content);
      if (!retryParsed) throw new Error('Could not parse storybook JSON after retry');
      await saveStorybook(eventId, retryParsed);
    } else {
      await saveStorybook(eventId, parsed);
    }
  } catch (err) {
    console.error('Storybook generation failed:', err);
    await upsertStorybook(eventId, { status: 'error' });
  }
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function saveStorybook(eventId, data) {
  await upsertStorybook(eventId, {
    title: data.title,
    narrative: data,
    summary: data.closing,
    status: 'complete',
    generated_at: new Date().toISOString(),
  });
}

async function upsertStorybook(eventId, fields) {
  await supabase.from('storybooks').upsert(
    { event_id: eventId, ...fields },
    { onConflict: 'event_id' }
  );
}
