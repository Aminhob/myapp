import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, useTheme, TextInput as PaperTextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { spacing, Colors } from '../../theme';
import BrandInput from '../../components/ui/BrandInput';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const [show, setShow] = useState(false);

  const onLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError('Gelitaan wuu fashilmay. Hubi xogta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[ '#030712', '#061026', '#010417' ]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      <View style={styles.pulseOne} />
      <View style={styles.pulseTwo} />

      <View style={styles.header}>
        <View style={styles.logoAura}>
          <LinearGradient
            colors={['rgba(254,77,45,0.45)', 'rgba(1,204,255,0.25)']}
            style={styles.logoGlow}
          >
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons name="office-building" size={30} color="#fff" />
            </View>
          </LinearGradient>
        </View>
        <Text variant="headlineSmall" style={[styles.brandTitle, { color: theme.colors.onBackground }]}>eMaamul Cloud Suite</Text>
        <Text style={styles.brandCaption}>
          Smart finance cockpit for modern enterprises. Stay ahead with real-time cashflow intelligence.
        </Text>
      </View>

      <LinearGradient
        colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.04)']}
        style={styles.cardShell}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text variant="titleLarge" style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardSubtitle}>Unlock enterprise-grade insights instantly.</Text>
            </View>
            <View style={styles.securityBadge}>
              <MaterialCommunityIcons name="shield-check" size={16} color={Colors.primary} />
              <Text style={styles.securityBadgeText}>Secure zone</Text>
            </View>
          </View>

          <View style={styles.inputs}>
            <BrandInput
              mode="outlined"
              label="Magaca Isticmaalaha"
              placeholder="Geli magacaaga isticmaale"
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              keyboardType='email-address'
              left={<PaperTextInput.Icon icon="account-outline" />}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
            <BrandInput
              mode="outlined"
              label="Erayga Sirta ah"
              placeholder="Geli eraygaaga sirta ah"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
              left={<PaperTextInput.Icon icon="lock-outline" />}
              right={<PaperTextInput.Icon icon={show ? 'eye-off' : 'eye'} onPress={() => setShow(s => !s)} />}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Button
            mode="contained"
            buttonColor={Colors.primary}
            onPress={onLogin}
            loading={loading}
            style={styles.primaryButton}
            contentStyle={{ paddingVertical: spacing(0.75) }}
            labelStyle={{ fontFamily: 'Poppins_600SemiBold', letterSpacing: 0.8 }}
          >
            Soo gal
          </Button>

          <View style={styles.bottomRow}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>Ma hilmaantay sirta?</Text>
            </TouchableOpacity>
            <View style={styles.sessionStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.sessionText}>AES-512 live</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ma lihid akoon?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.footerLink}>Akoon cusub samayso</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing(3),
    paddingTop: spacing(6),
    paddingBottom: spacing(4),
    justifyContent: 'center',
    position: 'relative',
  },
  pulseOne: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(254,77,45,0.16)',
    opacity: 0.85,
    shadowColor: 'rgba(254,77,45,0.85)',
    shadowOpacity: 0.45,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 24 },
  },
  pulseTwo: {
    position: 'absolute',
    bottom: -120,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(1,204,255,0.18)',
    opacity: 0.8,
    shadowColor: 'rgba(1,204,255,0.7)',
    shadowOpacity: 0.45,
    shadowRadius: 90,
    shadowOffset: { width: 0, height: 24 },
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  logoAura: {
    width: 100,
    height: 100,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: spacing(1.5),
  },
  logoGlow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    padding: spacing(0.75),
  },
  logoBadge: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,12,24,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  brandTitle: {
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  brandCaption: {
    marginTop: spacing(1),
    textAlign: 'center',
    color: Colors.mutedDark,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: spacing(2.5),
    fontFamily: 'Poppins_400Regular',
  },
  cardShell: {
    borderRadius: 30,
    padding: 1.5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: spacing(4),
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 24 },
    elevation: 16,
  },
  card: {
    borderRadius: 28,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(2.5),
    backgroundColor: 'rgba(5,12,24,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing(2.5),
  },
  cardTitle: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  cardSubtitle: {
    marginTop: spacing(0.5),
    color: Colors.muted,
    fontSize: 12.5,
    lineHeight: 18,
    maxWidth: 200,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(1,204,255,0.12)',
    borderRadius: 999,
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(1.5),
    borderWidth: 1,
    borderColor: 'rgba(1,204,255,0.28)',
  },
  securityBadgeText: {
    marginLeft: spacing(0.75),
    fontSize: 11.5,
    color: Colors.mutedDark,
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  inputs: {
    gap: spacing(1.5),
    marginBottom: spacing(2),
  },
  input: {
    backgroundColor: 'rgba(9,18,36,0.85)',
    borderRadius: 20,
  },
  inputOutline: {
    borderRadius: 20,
    borderColor: 'rgba(1,204,255,0.22)',
    borderWidth: 1.2,
  },
  error: {
    color: Colors.danger,
    marginBottom: spacing(1.5),
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  primaryButton: {
    borderRadius: 18,
    marginBottom: spacing(2.5),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    color: Colors.primary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(1,204,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: spacing(1.2),
    paddingVertical: spacing(0.5),
    borderWidth: 1,
    borderColor: 'rgba(1,204,255,0.18)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.success,
    marginRight: spacing(0.75),
  },
  sessionText: {
    color: Colors.mutedDark,
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(1),
  },
  footerText: {
    color: Colors.mutedDark,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  footerLink: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13.5,
    textDecorationLine: 'underline',
  },
});
