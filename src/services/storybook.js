import { supabase } from './supabase.js';
import { BackboardClient } from 'backboard-sdk';

const client = new BackboardClient({ apiKey: process.env.BACKBOARD_API_KEY });

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

    // Analyze each photo individually with vision so the AI actually sees the image
    const pages = [];
    for (const photo of event.photos) {
      const contributor = photo.attendees?.name ?? 'a guest';
      const userCaption = photo.user_caption ? `\nThe photographer added: "${photo.user_caption}"` : '';

      const captionResponse = await client.sendMessage({
        content: [
          {
            type: 'text',
            text:
              `You are writing a warm, heartfelt family storybook. ` +
              `This photo was taken by ${contributor} at an event called "${event.name}".${userCaption}\n` +
              `Look at the image and write 2–3 sentences that capture this moment as if narrating a cherished keepsake. ` +
              `Be specific about what you actually see — people, expressions, setting, mood. ` +
              `Do not be generic. Respond with only the caption text, no quotes or labels.`,
          },
          {
            type: 'image_url',
            image_url: { url: photo.cloudinary_url },
          },
        ],
        memory: 'Auto',
      });

      pages.push({
        photo_url: photo.cloudinary_url,
        contributor,
        user_caption: photo.user_caption ?? null,
        caption: captionResponse.content.trim(),
      });
    }

    // Generate the overall narrative using the per-photo captions
    const pagesSummary = pages
      .map((p, i) => `Photo ${i + 1} by ${p.contributor}: ${p.caption}`)
      .join('\n\n');

    const toneInstruction = customPrompt ? `\nOrganizer's guidance: "${customPrompt}"\n` : '';

    const narrativeResponse = await client.sendMessage({
      content:
        `Write a title and a closing paragraph for a family storybook about "${event.name}"` +
        (event.event_date ? ` on ${event.event_date}` : '') + `.\n` +
        toneInstruction +
        `Here are the moments captured:\n\n${pagesSummary}\n\n` +
        `Respond with ONLY valid JSON in this exact shape:\n` +
        `{ "title": "storybook title", "closing": "closing narrative paragraph" }`,
      memory: 'Auto',
    });

    const parsed = extractJSON(narrativeResponse.content);
    if (!parsed) throw new Error('Could not parse narrative JSON');

    const storybookData = {
      title: parsed.title,
      pages,
      closing: parsed.closing,
    };

    await upsertStorybook(eventId, {
      title: storybookData.title,
      narrative: storybookData,
      summary: storybookData.closing,
      status: 'complete',
      generated_at: new Date().toISOString(),
    });

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

async function upsertStorybook(eventId, fields) {
  await supabase.from('storybooks').upsert(
    { event_id: eventId, ...fields },
    { onConflict: 'event_id' }
  );
}
