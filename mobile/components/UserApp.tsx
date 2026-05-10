import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, Event, MegaStorybook } from '../services/api';
import SignOutButton from './SignOutButton';

type Screen = 'events' | 'storybook';

interface Props {
  telegramId: string;
  onLogout: () => void;
}

export default function UserApp({ telegramId, onLogout }: Props) {
  const [screen, setScreen] = useState<Screen>('events');
  const [megaStorybook, setMegaStorybook] = useState<MegaStorybook | null>(null);

  if (screen === 'storybook' && megaStorybook) {
    return (
      <MegaStorybookView
        storybook={megaStorybook}
        onBack={() => setScreen('events')}
      />
    );
  }

  return (
    <EventsView
      telegramId={telegramId}
      onStorybook={(sb) => { setMegaStorybook(sb); setScreen('storybook'); }}
    />
  );
}

// ─── Events selection screen ──────────────────────────────────────────────────

function EventsView({ telegramId, onStorybook }: {
  telegramId: string;
  onStorybook: (sb: MegaStorybook) => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const PHOTO_SIZE = (width - 48 - 8) / 3;

  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.contributor.events(telegramId);
      setEvents(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleGenerate() {
    if (!selected.size) return;
    setGenerating(true);
    setError('');
    try {
      const result = await api.storybooks.mega([...selected], prompt);
      onStorybook(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Contributions</Text>
        <Text style={styles.headerSub}>Select events to weave into your story</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C96A2C" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No contributions yet</Text>
          <Text style={styles.emptySub}>Submit photos via the Telegram bot to see them here.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {events.map(event => {
            const isSelected = selected.has(event.id);
            return (
              <Pressable
                key={event.id}
                style={[styles.eventCard, isSelected && styles.eventCardSelected]}
                onPress={() => toggleSelect(event.id)}
              >
                {/* Checkbox */}
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  {event.event_date && (
                    <Text style={styles.eventDate}>
                      {new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                  )}
                  <Text style={styles.photoCount}>{event.photos?.length ?? 0} photo{(event.photos?.length ?? 0) !== 1 ? 's' : ''}</Text>
                </View>

                {/* Photo strip */}
                {(event.photos?.length ?? 0) > 0 && (
                  <View style={styles.photoStrip}>
                    {event.photos!.slice(0, 3).map(p => (
                      <Image
                        key={p.id}
                        source={{ uri: p.cloudinary_url }}
                        style={{ width: PHOTO_SIZE * 0.6, height: PHOTO_SIZE * 0.6, borderRadius: 6, backgroundColor: '#EEE' }}
                      />
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}

          <View style={styles.generateSection}>
            <TextInput
              style={styles.promptInput}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Optional tone or theme for your mega storybook..."
              placeholderTextColor="#BBB"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable
              style={[styles.generateBtn, (!selected.size || generating) && styles.generateBtnDisabled]}
              onPress={handleGenerate}
              disabled={!selected.size || generating}
            >
              {generating ? (
                <View style={styles.generatingRow}>
                  <ActivityIndicator color="#FFF" style={{ marginRight: 10 }} />
                  <Text style={styles.generateBtnText}>Writing your story...</Text>
                </View>
              ) : (
                <Text style={styles.generateBtnText}>
                  {selected.size === 0
                    ? 'Select events above'
                    : `Create Mega Storybook (${selected.size} event${selected.size !== 1 ? 's' : ''})`}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      <View style={{ paddingBottom: insets.bottom }}>
        <SignOutButton />
      </View>
    </View>
  );
}

// ─── Mega storybook viewer ────────────────────────────────────────────────────

function MegaStorybookView({ storybook, onBack }: { storybook: MegaStorybook; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photoWidth = width - 48;
  const photoHeight = photoWidth * 0.75;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.storybookContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
    >
      <Text style={styles.storybookTitle}>{storybook.title}</Text>

      {storybook.sections.map((section, si) => (
        <View key={si} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionName}>{section.event_name}</Text>
            {section.event_date && (
              <Text style={styles.sectionDate}>
                {new Date(section.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            )}
          </View>

          {section.pages.map((page, pi) => (
            <View key={pi} style={styles.page}>
              <Image
                source={{ uri: page.photo_url }}
                style={{ width: photoWidth, height: photoHeight, borderRadius: 16, backgroundColor: '#EEE', marginBottom: 12 }}
                resizeMode="cover"
              />
              <Text style={styles.contributor}>— {page.contributor}</Text>
              <Text style={styles.caption}>{page.caption}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.closingBox}>
        <View style={styles.divider} />
        <Text style={styles.closingText}>{storybook.closing}</Text>
      </View>

      <Pressable style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back to Events</Text>
      </Pressable>

      <SignOutButton />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAF8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#C96A2C' },
  headerSub: { fontSize: 12, color: '#AAA', marginTop: 3 },

  list: { padding: 20, gap: 14 },

  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventCardSelected: { borderColor: '#C96A2C', backgroundColor: '#FFF8F4' },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  checkboxSelected: { backgroundColor: '#C96A2C', borderColor: '#C96A2C' },
  checkmark: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  eventInfo: { marginBottom: 10 },
  eventName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  eventDate: { fontSize: 13, color: '#888', marginBottom: 2 },
  photoCount: { fontSize: 13, color: '#C96A2C', fontWeight: '600' },

  photoStrip: { flexDirection: 'row', gap: 4 },

  generateSection: {
    gap: 10,
    paddingTop: 8,
  },
  promptInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  errorText: { color: '#E53935', fontSize: 13, textAlign: 'center' },
  generateBtn: {
    backgroundColor: '#C96A2C',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#C96A2C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  generateBtnDisabled: { backgroundColor: '#DDD', shadowOpacity: 0 },
  generateBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  generatingRow: { flexDirection: 'row', alignItems: 'center' },

  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },

  // Storybook viewer
  storybookContent: { paddingHorizontal: 24 },
  storybookTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 36,
  },
  section: { marginBottom: 32 },
  sectionHeader: {
    borderLeftWidth: 3,
    borderLeftColor: '#C96A2C',
    paddingLeft: 12,
    marginBottom: 16,
  },
  sectionName: { fontSize: 18, fontWeight: '700', color: '#C96A2C' },
  sectionDate: { fontSize: 13, color: '#888', marginTop: 2 },
  page: { marginBottom: 28 },
  contributor: { fontSize: 13, color: '#C96A2C', fontWeight: '600', fontStyle: 'italic', marginBottom: 6 },
  caption: { fontSize: 16, color: '#333', lineHeight: 24 },
  closingBox: { marginTop: 8, paddingTop: 24 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 24 },
  closingText: { fontSize: 17, color: '#444', lineHeight: 28, fontStyle: 'italic', textAlign: 'center' },
  backBtn: {
    marginTop: 32,
    borderWidth: 1.5,
    borderColor: '#CCC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  backBtnText: { color: '#888', fontWeight: '600', fontSize: 15 },
});
