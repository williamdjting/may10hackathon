import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { api, Storybook } from '../../services/api';
import SignOutButton from '../../components/SignOutButton';

export default function StorybookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const photoWidth = width - 48;
  const photoHeight = photoWidth * 0.75;

  const load = useCallback(async () => {
    try {
      const sb = await api.storybooks.get(id);
      setStorybook(sb);
      navigation.setOptions({ title: sb.title ?? 'Storybook' });
      if (sb.status === 'generating') setPolling(true);
      else setPolling(false);
    } catch {
      // storybook not ready yet
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!polling) return;
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [polling, load]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#C96A2C" /></View>;
  }

  if (!storybook || storybook.status === 'generating') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C96A2C" style={{ marginBottom: 16 }} />
        <Text style={styles.generatingTitle}>Writing your story...</Text>
        <Text style={styles.generatingSubtitle}>This usually takes 20–30 seconds.</Text>
      </View>
    );
  }

  if (storybook.status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not generate storybook. Please try again.</Text>
      </View>
    );
  }

  const { narrative } = storybook;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
    >
      <Text style={styles.title}>{narrative.title}</Text>

      {narrative.pages.map((page, i) => (
        <View key={i} style={styles.page}>
          <Image
            source={{ uri: page.photo_url }}
            style={{ width: photoWidth, height: photoHeight, borderRadius: 18, backgroundColor: '#EEE', marginBottom: 14 }}
            resizeMode="cover"
          />
          <View style={styles.pageText}>
            <Text style={styles.contributor}>— {page.contributor}</Text>
            <Text style={styles.caption}>{page.caption}</Text>
          </View>
        </View>
      ))}

      <View style={styles.closing}>
        <View style={styles.divider} />
        <Text style={styles.closingText}>{narrative.closing}</Text>
      </View>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back to Event</Text>
      </Pressable>

      <SignOutButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 38,
  },
  page: { marginBottom: 40 },
  pageText: { paddingHorizontal: 4 },
  contributor: {
    fontSize: 13,
    color: '#C96A2C',
    fontWeight: '600',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  caption: { fontSize: 16, color: '#333', lineHeight: 24 },
  closing: { marginTop: 16, paddingTop: 24 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 24 },
  closingText: {
    fontSize: 17,
    color: '#444',
    lineHeight: 28,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 32,
    borderWidth: 1.5,
    borderColor: '#CCC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  backButtonText: { color: '#888', fontWeight: '600', fontSize: 15 },
  generatingTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  generatingSubtitle: { fontSize: 15, color: '#888' },
  errorText: { fontSize: 16, color: '#E53935', textAlign: 'center' },
});
