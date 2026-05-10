import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { api, Event, Storybook } from '../../services/api';

const BOT_USERNAME = process.env.EXPO_PUBLIC_BOT_USERNAME ?? 'CandidMomentsBot';
const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48 - 8) / 3;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [event, setEvent] = useState<Event | null>(null);
  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ev, sb] = await Promise.allSettled([
        api.events.get(id),
        api.storybooks.get(id),
      ]);
      if (ev.status === 'fulfilled') {
        setEvent(ev.value);
        navigation.setOptions({ title: ev.value.name });
      }
      if (sb.status === 'fulfilled') setStorybook(sb.value);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, navigation]);

  useEffect(() => { load(); }, [load]);

  async function handleShare() {
    if (!event) return;
    const link = `https://t.me/${BOT_USERNAME}?start=${event.code}`;
    await Share.share({ message: `Join ${event.name} on CandidMoments!\nTap to contribute your photo: ${link}` });
  }

  async function handleGenerate() {
    if (!event) return;
    if (!event.photos?.length) {
      Alert.alert('No photos yet', 'Wait for attendees to submit photos before generating the storybook.');
      return;
    }
    Alert.alert('Generate Storybook', 'This will create an AI storybook from all submitted photos. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Generate',
        onPress: async () => {
          setGenerating(true);
          await api.storybooks.generate(id);
          router.push(`/storybook/${id}`);
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#C96A2C" /></View>;
  }

  if (!event) {
    return <View style={styles.center}><Text>Event not found.</Text></View>;
  }

  const photoCount = event.photos?.length ?? 0;
  const attendeeCount = event.attendees?.length ?? 0;
  const submittedCount = event.attendees?.filter(a => a.status === 'submitted').length ?? 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBox label="Attendees" value={attendeeCount} />
        <StatBox label="Photos" value={photoCount} />
        <StatBox label="Submitted" value={submittedCount} />
      </View>

      {/* Invite section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invite Code</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{event.code}</Text>
        </View>
        <Pressable style={styles.outlineButton} onPress={handleShare}>
          <Text style={styles.outlineButtonText}>Share Telegram Invite Link</Text>
        </Pressable>
      </View>

      {/* Photos grid */}
      {photoCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos ({photoCount})</Text>
          <View style={styles.photoGrid}>
            {event.photos!.map(photo => (
              <Image
                key={photo.id}
                source={{ uri: photo.cloudinary_url }}
                style={styles.photoThumb}
              />
            ))}
          </View>
        </View>
      )}

      {/* Storybook CTA */}
      <View style={styles.section}>
        {storybook?.status === 'complete' ? (
          <Pressable style={styles.primaryButton} onPress={() => router.push(`/storybook/${id}`)}>
            <Text style={styles.primaryButtonText}>View Storybook</Text>
          </Pressable>
        ) : storybook?.status === 'generating' ? (
          <View style={styles.generatingBox}>
            <ActivityIndicator color="#C96A2C" style={{ marginBottom: 8 }} />
            <Text style={styles.generatingText}>Creating your storybook...</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.primaryButton, generating && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={generating}
          >
            <Text style={styles.primaryButtonText}>
              {generating ? 'Starting...' : 'Generate Storybook'}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', padding: 20, gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#C96A2C' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  codeBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C96A2C',
  },
  codeText: { fontSize: 36, fontWeight: '900', letterSpacing: 8, color: '#C96A2C' },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#C96A2C',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  outlineButtonText: { color: '#C96A2C', fontWeight: '600', fontSize: 15 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  photoThumb: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 8, backgroundColor: '#EEE' },
  primaryButton: {
    backgroundColor: '#C96A2C',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
  generatingBox: { alignItems: 'center', padding: 24 },
  generatingText: { color: '#888', fontSize: 15 },
});
