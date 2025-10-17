import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Switch, Text } from 'react-native-paper';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandCard from '../../components/ui/BrandCard';
import { spacing, Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
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

export default function SettingsNotificationsScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [invoiceReminder, setInvoiceReminder] = useState(profile?.preferences?.notifications?.invoice ?? true);
  const [debtAlert, setDebtAlert] = useState(profile?.preferences?.notifications?.debt ?? true);
  const [dailySummary, setDailySummary] = useState(profile?.preferences?.notifications?.dailySummary ?? false);
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (!auth?.currentUser) return;
    setBusy(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        preferences: {
          ...profile?.preferences,
          notifications: {
            invoice: invoiceReminder,
            debt: debtAlert,
            dailySummary,
          },
        },
      }, { merge: true });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title="Notifications" subtitle="Control alerts and reminders" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(4), gap: spacing(2) }}>
        <BrandCard border={false} style={{ backgroundColor: 'rgba(1,0,42,0.24)', borderRadius: 24, padding: spacing(2) }}>
          <ToggleRow label="Invoice reminders" sublabel="Alerts when rasiidyada need follow-up" value={invoiceReminder} onChange={setInvoiceReminder} showDivider />
          <ToggleRow label="Debt alerts" sublabel="Stay ahead of overdue dayn" value={debtAlert} onChange={setDebtAlert} showDivider />
          <ToggleRow label="Daily business summary" sublabel="Receive morning recap of sales" value={dailySummary} onChange={setDailySummary} />
        </BrandCard>
        <Button
          mode="contained"
          loading={busy}
          onPress={handleSave}
          style={{ borderRadius: 20 }}
          contentStyle={{ paddingVertical: spacing(1) }}
          labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          Save notification settings
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
