import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from 'firebase/firestore';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandInput from '../../components/ui/BrandInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { spacing, Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../lib/firebase';

export default function SettingsBusinessScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [businessName, setBusinessName] = useState(profile?.businessName || profile?.companyName || '');
  const [companyName, setCompanyName] = useState(profile?.companyName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl || '');
  const [busy, setBusy] = useState(false);

  const pickLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.length) {
      setLogoUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!auth?.currentUser) return;
    setBusy(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        businessName,
        companyName,
        phone,
        address,
        logoUrl,
      }, { merge: true });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title="Business" subtitle="Manage company information" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(4) }}>
        <View style={{ alignItems: 'center', marginBottom: spacing(3) }}>
          <Avatar.Image size={108} source={logoUrl ? { uri: logoUrl } : undefined} style={{ backgroundColor: 'rgba(254,77,45,0.18)' }} />
          <Button mode="outlined" icon="image-edit" onPress={pickLogo} style={{ marginTop: spacing(1.25), borderRadius: 18 }} contentStyle={{ paddingVertical: spacing(0.75), paddingHorizontal: spacing(1.5) }} textColor={Colors.primary}>
            Update logo
          </Button>
        </View>
        <BrandInput label="Business Name" value={businessName} onChangeText={setBusinessName} style={{ marginBottom: spacing(1.5) }} />
        <BrandInput label="Registered Company" value={companyName} onChangeText={setCompanyName} style={{ marginBottom: spacing(1.5) }} />
        <BrandInput label="Contact Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginBottom: spacing(1.5) }} />
        <BrandInput label="Address" value={address} onChangeText={setAddress} multiline style={{ marginBottom: spacing(1.5) }} />
        <Button
          mode="contained"
          loading={busy}
          onPress={handleSave}
          style={{ borderRadius: 20, marginTop: spacing(1) }}
          contentStyle={{ paddingVertical: spacing(1) }}
          labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          Save business info
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
