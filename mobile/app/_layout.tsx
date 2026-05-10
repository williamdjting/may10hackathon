import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
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
