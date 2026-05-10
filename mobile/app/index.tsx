import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api, Event } from '../services/api';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.events.list();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(item: Event) {
    const confirm = typeof window !== 'undefined'
      ? window.confirm(`Delete "${item.name}"? This cannot be undone.`)
      : false;

    if (typeof window !== 'undefined') {
      if (!confirm) return;
      api.events.delete(item.id)
        .then(() => setEvents(prev => prev.filter(e => e.id !== item.id)))
        .catch(e => alert(e.message));
    } else {
      Alert.alert('Delete Event', `Delete "${item.name}"? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            api.events.delete(item.id)
              .then(() => setEvents(prev => prev.filter(e => e.id !== item.id)))
              .catch(e => Alert.alert('Error', e.message)),
        },
      ]);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C96A2C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySubtitle}>Create your first gathering below.</Text>
          </View>
        }
        ListHeaderComponent={<Text style={styles.heading}>Your Gatherings</Text>}
        renderItem={({ item }) => (
          <View style={styles.cardRow}>
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/event/${item.id}`)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={[styles.badge, item.status === 'active' ? styles.badgeActive : styles.badgeDone]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              {item.event_date && (
                <Text style={styles.cardDate}>{new Date(item.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
              )}
              <Text style={styles.cardCode}>Code: {item.code}</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => router.push('/create')}
      >
        <Text style={styles.fabText}>+ New Event</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20 },
  heading: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 8 },
  cardDate: { fontSize: 14, color: '#888', marginBottom: 4 },
  cardCode: { fontSize: 13, color: '#C96A2C', fontWeight: '600', marginTop: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  deleteBtn: {
    marginLeft: 10,
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: '#E53935', fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeActive: { backgroundColor: '#E8F5E9' },
  badgeDone: { backgroundColor: '#FFF3E0' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#444' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#888' },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#C96A2C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 40,
    shadowColor: '#C96A2C',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
