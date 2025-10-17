import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Switch, Text } from 'react-native-paper';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandCard from '../../components/ui/BrandCard';
import BrandInput from '../../components/ui/BrandInput';
import { spacing, Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../lib/firebase';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

const ToggleRow = ({ label, sublabel, value, onChange, showDivider }) => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing(1.25) }}>
      <View style={{ flex: 1, marginRight: spacing(1.5) }}>
        <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold' }}>{label}</Text>
        {!!sublabel && <Text style={{ color: Colors.mutedSurface, fontSize: 12, marginTop: spacing(0.25) }}>{sublabel}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} color={Colors.primary} />
    </View>
    {showDivider && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
  </View>
);

export default function SettingsSecurityScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [pinEnabled, setPinEnabled] = useState(profile?.preferences?.security?.pinEnabled ?? false);
  const [pinCode, setPinCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;
    setBusy(true);
    try {
      if (!profile?.id) return;
      if (newPassword && auth.currentUser) {
        await auth.currentUser.updatePassword(newPassword).catch(() => {});
      }
      await db.collection('users').doc(profile.id).set({
        preferences: {
          ...profile?.preferences,
          security: {
            pinEnabled,
            pinCode: pinEnabled ? pinCode : null,
          },
        },
        updated_at: new Date().toISOString(),
      }, { merge: true });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title="Security" subtitle="Manage PIN and password" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(4), gap: spacing(2) }}>
        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <ToggleRow label="Enable app PIN" sublabel="Protect access with quick unlock" value={pinEnabled} onChange={setPinEnabled} showDivider={pinEnabled} />
          {pinEnabled && (
            <BrandInput label="PIN Code" value={pinCode} onChangeText={setPinCode} keyboardType="numeric" style={{ marginTop: spacing() }} />
          )}
        </BrandCard>

        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing() }}>Password</Text>
          <BrandInput label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry style={{ marginBottom: spacing(1.5) }} />
          <Text style={{ color: Colors.mutedSurface, fontSize: 12 }}>Password will update immediately when saved.</Text>
        </BrandCard>

        <Button
          mode="contained"
          loading={busy}
          onPress={handleSave}
          style={{ borderRadius: 20 }}
          contentStyle={{ paddingVertical: spacing(1) }}
          labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          Save security settings
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
