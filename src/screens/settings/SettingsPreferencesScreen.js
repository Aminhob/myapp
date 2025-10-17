import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandCard from '../../components/ui/BrandCard';
import { spacing, Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

const LANG_OPTIONS = [
  { key: 'so', label: 'Somali' },
  { key: 'en', label: 'English' },
];

const THEME_OPTIONS = [
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },
];

const CURRENCY_OPTIONS = [
  { key: 'default', label: 'Default' },
];

export default function SettingsPreferencesScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [language, setLanguage] = useState(profile?.preferences?.language || 'so');
  const [themeMode, setThemeMode] = useState(profile?.preferences?.themeMode || 'dark');
  const [currency, setCurrency] = useState(profile?.preferences?.currency || 'default');
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (!auth?.currentUser) return;
    setBusy(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        preferences: {
          language,
          themeMode,
          currency,
        },
      }, { merge: true });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  const renderChips = (options, selected, setter) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(0.75) }}>
      {options.map((option) => {
        const active = selected === option.key;
        return (
          <Chip
            key={option.key}
            selected={active}
            onPress={() => setter(option.key)}
            style={{ backgroundColor: active ? 'rgba(254,77,45,0.22)' : 'rgba(255,255,255,0.08)', borderRadius: 18 }}
            textStyle={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}
          >
            {option.label}
          </Chip>
        );
      })}
    </View>
  );

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title="Preferences" subtitle="Languages, currency and theme" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(4), gap: spacing(2) }}>
        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing() }}>Language</Text>
          {renderChips(LANG_OPTIONS, language, setLanguage)}
        </BrandCard>

        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing() }}>Theme Mode</Text>
          {renderChips(THEME_OPTIONS, themeMode, setThemeMode)}
        </BrandCard>

        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing() }}>Currency</Text>
          {renderChips(CURRENCY_OPTIONS, currency, setCurrency)}
        </BrandCard>

        <Button
          mode="contained"
          loading={busy}
          onPress={handleSave}
          style={{ borderRadius: 20, marginTop: spacing(1) }}
          contentStyle={{ paddingVertical: spacing(1) }}
          labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          Save preferences
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
