import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginView, { Role } from '../components/LoginView';
import UserApp from '../components/UserApp';

export default function RootLayout() {
  const [role, setRole] = useState<Role | null>(null);
  const [telegramId, setTelegramId] = useState<string | undefined>();

  function handleLogin(r: Role, tid?: string) {
    setTelegramId(tid);
    setRole(r);
  }

  function handleLogout() {
    setRole(null);
    setTelegramId(undefined);
  }

  if (!role) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <LoginView onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  if (role === 'user') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <UserApp telegramId={telegramId!} onLogout={handleLogout} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FAFAF8' },
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#FAFAF8' },
          headerRight: () => (
            <Pressable onPress={handleLogout} style={{ marginRight: 4 }}>
              <Text style={{ color: '#888', fontSize: 14, fontWeight: '600' }}>Sign out</Text>
            </Pressable>
          ),
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'CandidMoments',
            headerTitleStyle: { fontWeight: '800', fontSize: 20, color: '#C96A2C' },
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
