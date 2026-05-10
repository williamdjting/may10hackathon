import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: Props) {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin() {
    if (username.trim() === 'admin' && password === 'admin') {
      setError('');
      onLogin();
    } else {
      setError('Incorrect username or password.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <View style={styles.cameraBump} />
            <View style={styles.cameraBody}>
              <View style={styles.cameraLens} />
            </View>
          </View>
        </View>

        {/* Brand */}
        <Text style={styles.brand}>CandidMoments</Text>
        <Text style={styles.slogan}>Every gathering deserves a story.</Text>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={t => { setUsername(t); setError(''); }}
            placeholder="Username"
            placeholderTextColor="#BBB"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            placeholder="Password"
            placeholderTextColor="#BBB"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAF8' },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  // Logo — camera shape built from Views
  logoWrap: { marginBottom: 28 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C96A2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBump: {
    width: 22,
    height: 8,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 2,
    alignSelf: 'flex-start',
    marginLeft: 24,
  },
  cameraBody: {
    width: 58,
    height: 42,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C96A2C',
    borderWidth: 3,
    borderColor: '#FAFAF8',
  },

  // Brand
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#C96A2C',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: '#888',
    marginBottom: 48,
    textAlign: 'center',
  },

  // Form
  form: { width: '100%', gap: 14 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  error: {
    color: '#E53935',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -4,
  },
  button: {
    backgroundColor: '#C96A2C',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#C96A2C',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
});
