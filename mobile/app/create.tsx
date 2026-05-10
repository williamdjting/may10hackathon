import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { api } from '../services/api';

export default function CreateScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'New Gathering' });
  }, [navigation]);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please give your gathering a name.');
      return;
    }
    setLoading(true);
    try {
      const event = await api.events.create({ name: name.trim(), description: description.trim(), event_date: date });
      router.replace(`/event/${event.id}`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Gathering name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Mom's Birthday Brunch"
          placeholderTextColor="#BBB"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="What's the occasion?"
          placeholderTextColor="#BBB"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-05-10"
          placeholderTextColor="#BBB"
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            After creating, share the event code with attendees so they can contribute photos via the Telegram bot.
          </Text>
        </View>

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Gathering'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 60 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 20 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  multiline: { height: 90, textAlignVertical: 'top' },
  hint: {
    backgroundColor: '#FFF8F3',
    borderRadius: 12,
    padding: 14,
    marginTop: 28,
    borderLeftWidth: 3,
    borderLeftColor: '#C96A2C',
  },
  hintText: { fontSize: 14, color: '#666', lineHeight: 20 },
  button: {
    backgroundColor: '#C96A2C',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
});
