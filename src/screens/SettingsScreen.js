import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { spacing, Colors } from '../theme';
import BrandHeader from '../components/ui/BrandHeader';
import BrandCard from '../components/ui/BrandCard';
import ScreenWrapper from '../components/ui/ScreenWrapper';

const SECTIONS = [
  {
    id: 'account',
    title: 'Account',
    items: [
      { key: 'profile', label: 'Profile Settings', icon: 'account-circle-outline', route: 'SettingsProfile' },
      { key: 'business', label: 'Business Info', icon: 'briefcase-outline', route: 'SettingsBusiness' },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferences',
    items: [
      { key: 'preferences', label: 'Language, Currency & Theme', icon: 'earth', route: 'SettingsPreferences' },
      { key: 'notifications', label: 'Notifications & Reminders', icon: 'bell-ring-outline', route: 'SettingsNotifications' },
      { key: 'security', label: 'Security & Privacy', icon: 'shield-lock-outline', route: 'SettingsSecurity' },
    ],
  },
  {
    id: 'about',
    title: 'About',
    items: [
      { key: 'about', label: 'About eMaamul & Logout', icon: 'information-outline', route: 'SettingsAbout' },
    ],
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  const handleNavigate = (route) => {
    if (!route) return;
    navigation.navigate(route);
  };

  const SectionCard = ({ section }) => (
    <BrandCard
      border={false}
      style={{
        backgroundColor: 'rgba(1,0,42,0.24)',
        borderRadius: 24,
        paddingVertical: spacing(1),
        paddingHorizontal: spacing(0.75),
      }}
    >
      {section.items.map((item, index) => (
        <View key={item.key}>
          <TouchableRipple onPress={() => handleNavigate(item.route)} rippleColor={Colors.glow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(1.25), paddingHorizontal: spacing(0.75) }}>
              <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(254,77,45,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: spacing(1.5) }}>
                <MaterialCommunityIcons name={item.icon} size={24} color={Colors.primary} />
              </View>
              <Text style={{ flex: 1, color: '#fff', fontFamily: 'Poppins_500Medium', fontSize: 15 }}>
                {item.label}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.mutedSurface} />
            </View>
          </TouchableRipple>
          {index < section.items.length - 1 && (
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: spacing(6.5) }} />
          )}
        </View>
      ))}
    </BrandCard>
  );

  return (
    <ScreenWrapper backgroundColor={theme.colors.background}>
      <BrandHeader title="Settings" subtitle="Manage your eMaamul experience" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(6), gap: spacing(2.5) }}>
        {SECTIONS.map((section) => (
          <View key={section.id}>
            <Text style={{ color: Colors.mutedSurface, fontFamily: 'Poppins_600SemiBold', fontSize: 16, marginBottom: spacing(0.75), letterSpacing: 0.5 }}>
              {section.title}
            </Text>
            <SectionCard section={section} />
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}
