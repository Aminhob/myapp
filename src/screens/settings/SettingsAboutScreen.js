import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandCard from '../../components/ui/BrandCard';
import { spacing, Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

export default function SettingsAboutScreen() {
  const { signOut } = useAuth();

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title="About" subtitle="Learn more about eMaamul" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(4), gap: spacing(2) }}>
        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing(0.5) }}>Version</Text>
          <Text style={{ color: Colors.mutedSurface }}>1.0.0</Text>
        </BrandCard>

        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing(0.5) }}>Support</Text>
          <Text style={{ color: Colors.mutedSurface, marginBottom: spacing(0.25) }}>Email: support@emaamul.com</Text>
          <Text style={{ color: Colors.mutedSurface }}>Website: www.emaamul.com</Text>
        </BrandCard>

        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing(0.5) }}>Ku saabsan eMaamul</Text>
          <Text style={{ color: Colors.mutedSurface, lineHeight: 20 }}>
            eMaamul waa app casri ah oo loogu talagalay ganacsiyada Soomaalida si ay si fudud ugu diiwaangeliyaan iibka, kharashaadka, daymaha iyo rasiidyada. Waxay bixisaa warbixinno muuqaal leh, digniino degdeg ah iyo qalab kaa caawinaya inaad go'aan sax ah gaarto maalin kasta.
          </Text>
        </BrandCard>

        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing(0.5) }}>Privacy Policy</Text>
          <Text style={{ color: Colors.mutedSurface }}>We respect your privacy and protect your business data with secure backups.</Text>
        </BrandCard>

        <Button
          mode="contained"
          onPress={signOut}
          style={{ borderRadius: 20, marginTop: spacing(1) }}
          contentStyle={{ paddingVertical: spacing(1) }}
          labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          Logout
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
