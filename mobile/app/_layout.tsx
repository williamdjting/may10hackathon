import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginView, { Role } from '../components/LoginView';
import UserApp from '../components/UserApp';
import { authStore } from '../services/authStore';

export default function RootLayout() {
  const [role, setRole] = useState<Role | null>(null);
  const [telegramId, setTelegramId] = useState<string | undefined>();

  function handleLogout() {
    setRole(null);
    setTelegramId(undefined);
  }

  useEffect(() => {
    authStore.register(handleLogout);
  }, []);

  function handleLogin(r: Role, tid?: string) {
    setTelegramId(tid);
    setRole(r);
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
