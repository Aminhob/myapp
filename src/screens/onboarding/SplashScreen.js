import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, spacing } from '../../theme';

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]);

    animation.start();
    const timeout = setTimeout(() => {
      navigation.replace('Intro');
    }, 1800);

    return () => {
      animation.stop();
      clearTimeout(timeout);
    };
  }, [logoOpacity, logoScale, navigation, taglineOpacity]);

  return (
    <LinearGradient colors={['#01002a', '#050B16', '#fe3200']} style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.logoInner}>
            <Text style={styles.logoText}>eM</Text>
          </LinearGradient>
        </Animated.View>
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>Maamul Ganacsigaaga Si Fudud & Casri ah.</Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(3),
  },
  logoWrapper: {
    width: 180,
    height: 180,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fe3200',
    shadowOpacity: 0.5,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  logoInner: {
    width: 150,
    height: 150,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  logoText: {
    fontSize: 56,
    fontFamily: 'Poppins_700Bold',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  tagline: {
    marginTop: spacing(4),
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
    lineHeight: 24,
  },
});
