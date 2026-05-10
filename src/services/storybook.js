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

    const photoList = event.photos
      .map((p, i) => `Photo ${i + 1} by ${p.attendees?.name ?? 'a guest'}: ${p.cloudinary_url}`)
      .join('\n');

    const toneInstruction = customPrompt
      ? `The organizer has provided this guidance for the story: "${customPrompt}"\n\n`
      : '';

    const prompt =
      `You are a warm, creative storyteller creating a digital storybook for a gathering called "${event.name}".\n` +
      `Event description: ${event.description ?? 'A special gathering'}\n` +
      `Event date: ${event.event_date ?? 'Recently'}\n\n` +
      toneInstruction +
      `Here are photos contributed by attendees:\n${photoList}\n\n` +
      `For each photo write a short, heartfelt caption (2–3 sentences) as if narrating a family keepsake.\n` +
      `Then write a closing paragraph that weaves all the moments into one story.\n\n` +
      `Respond with ONLY valid JSON in this exact shape:\n` +
      `{\n` +
      `  "title": "storybook title",\n` +
      `  "pages": [\n` +
      `    { "photo_url": "...", "contributor": "...", "caption": "..." }\n` +
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
