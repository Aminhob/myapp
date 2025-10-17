import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandInput from '../../components/ui/BrandInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { spacing, Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../lib/firebase';

export default function SettingsProfileScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [photo, setPhoto] = useState(profile?.logoUrl || profile?.photoURL || '');
  const [busy, setBusy] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.length) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setBusy(true);
    try {
      if (email && email !== auth.currentUser.email) {
        await user.updateEmail(email).catch(() => {});
      }
      if (fullName || photo) {
        await user.updateProfile({ displayName: fullName, photoURL: photo || null }).catch(() => {});
      }
      await db.collection('users').doc(user.uid).set({ name: fullName, email, logoUrl: photo }, { merge: true });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title="Profile" subtitle="Update your personal info" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(4) }}>
        <View style={{ alignItems: 'center', marginBottom: spacing(3) }}>
          <Avatar.Image size={108} source={photo ? { uri: photo } : undefined} style={{ backgroundColor: 'rgba(254,77,45,0.18)' }} />
          <Button mode="outlined" icon="camera-outline" onPress={pickPhoto} style={{ marginTop: spacing(1.25), borderRadius: 18 }} contentStyle={{ paddingVertical: spacing(0.75), paddingHorizontal: spacing(1.5) }} textColor={Colors.primary}>
            Change photo
          </Button>
        </View>
        <BrandInput label="Full Name" value={fullName} onChangeText={setFullName} style={{ marginBottom: spacing(1.5) }} />
        <BrandInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ marginBottom: spacing(1.5) }} />
        <Button
          mode="contained"
          loading={busy}
          onPress={handleSave}
          style={{ borderRadius: 20, marginTop: spacing(1) }}
          contentStyle={{ paddingVertical: spacing(1) }}
          labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          Save changes
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
