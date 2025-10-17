import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'sales',
    title: 'Sales & Expenses',
    description: 'Si fudud u diiwaangeli iibka iyo kharashaadka.',
    icon: 'trending-up',
    accent: 'rgba(254,77,45,0.35)',
  },
  {
    key: 'inventory',
    title: 'Inventory & Customers',
    description: 'La soco alaabta iyo macaamiisha waqtiga-dhabta ah.',
    icon: 'cube-outline',
    accent: 'rgba(1,204,255,0.35)',
  },
  {
    key: 'reports',
    title: 'Reports & Invoices',
    description: 'Hel warbixino iyo rasiidyo PDF ah hal taabasho.',
    icon: 'file-chart',
    accent: 'rgba(32,224,112,0.35)',
  },
  {
    key: 'cloud',
    title: 'Cloud Sync & Offline',
    description: 'Xogtaada meel kasta, xitaa markaad offline tahay.',
    icon: 'cloud-sync-outline',
    accent: 'rgba(255,255,255,0.28)',
  },
];

function Dot({ index, progress }) {
  const inputRange = SLIDES.map((_, i) => i);
  const opacity = progress.interpolate({
    inputRange,
    outputRange: inputRange.map((i) => (i === index ? 1 : 0.3)),
    extrapolate: 'clamp',
  });
  const scale = progress.interpolate({
    inputRange,
    outputRange: inputRange.map((i) => (i === index ? 1 : 0.75)),
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
        marginHorizontal: 6,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

export default function IntroSlidesScreen({ navigation, onFinish }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoRef = useRef(null);
  const progress = useMemo(() => Animated.divide(scrollX, SCREEN_WIDTH), [scrollX]);

  const viewableConfig = useMemo(() => ({ viewAreaCoveragePercentThreshold: 50 }), []);

  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= SLIDES.length) return;
    listRef.current?.scrollToOffset({ offset: index * SCREEN_WIDTH, animated: true });
  }, []);

  const startAutoPlay = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev + 1;
        if (next < SLIDES.length) {
          listRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
          return next;
        }
        clearInterval(autoRef.current);
        return prev;
      });
    }, 4500);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(autoRef.current);
  }, [startAutoPlay]);

  const handleFinish = useCallback(async () => {
    clearInterval(autoRef.current);
    try {
      await AsyncStorage.setItem('onboardingSeen', 'true');
    } catch {}
    onFinish?.();
    navigation.replace('Auth');
  }, [navigation, onFinish]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  const handleNext = useCallback(() => {
    const next = currentSlide + 1;
    if (next < SLIDES.length) {
      goToSlide(next);
    } else {
      handleFinish();
    }
  }, [currentSlide, goToSlide, handleFinish]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      const idx = viewableItems[0].index || 0;
      setCurrentSlide(idx);
      if (idx < SLIDES.length - 1) {
        startAutoPlay();
      } else {
        clearInterval(autoRef.current);
      }
    }
  }).current;

  const renderItem = useCallback(({ item, index }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', item.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={item.icon} size={28} color="#fff" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </LinearGradient>
    </View>
  ), []);

  return (
    <LinearGradient colors={['#01002a', '#050B16', '#050B16']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>eMaamul</Text>
        <Button textColor="rgba(255,255,255,0.8)" onPress={handleSkip} labelStyle={styles.skipLabel}>
          Skip
        </Button>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewableConfig}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: spacing(5) }}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, index) => (
            <Dot key={slide.key} index={index} progress={progress} />
          ))}
        </View>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.primaryButton}
          contentStyle={{ paddingVertical: spacing(1.1) }}
          labelStyle={styles.primaryLabel}
        >
          {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    letterSpacing: 1,
  },
  skipLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.8,
    borderRadius: 32,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    minHeight: 360,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#fe3200',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2),
  },
  icon: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
  },
  title: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    marginBottom: spacing(1),
  },
  description: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing(2.5),
    paddingBottom: spacing(4),
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing(2),
  },
  primaryButton: {
    borderRadius: 18,
  },
  primaryLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
});
