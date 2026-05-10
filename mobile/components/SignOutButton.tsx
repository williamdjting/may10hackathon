import { Pressable, StyleSheet, Text, View } from 'react-native';
import { authStore } from '../services/authStore';

export default function SignOutButton() {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.btn} onPress={authStore.logout}>
        <Text style={styles.icon}>⏻</Text>
        <Text style={styles.label}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 20 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#C96A2C',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 40,
    shadowColor: '#C96A2C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  icon: { color: '#FFF', fontSize: 16 },
  label: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
