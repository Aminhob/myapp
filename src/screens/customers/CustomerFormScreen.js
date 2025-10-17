import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { spacing } from '../../theme';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandInput from '../../components/ui/BrandInput';
import { upsertCustomer } from '../../repositories/customerRepo';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

export default function CustomerFormScreen({ route, navigation }) {
  const editing = route.params?.customer || null;
  const [name, setName] = useState(editing?.name || '');
  const [phone, setPhone] = useState(editing?.phone || '');
  const [email, setEmail] = useState(editing?.email || '');
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    setBusy(true);
    try {
      await upsertCustomer({ id: editing?.id, name, phone, email });
      navigation.goBack();
    } finally { setBusy(false); }
  };

  return (
    <ScreenWrapper backgroundColor="#050B16">
      <BrandHeader title={editing ? 'Wax ka beddel Macmiil' : 'Macmiil Cusub'} />
      <View style={{ flex: 1, paddingHorizontal: spacing(2.5), paddingTop: spacing(2) }}>
        <BrandInput label="Magaca" value={name} onChangeText={setName} style={{ marginBottom: spacing() }} />
        <BrandInput label="Telefoon" value={phone} onChangeText={setPhone} keyboardType='phone-pad' style={{ marginBottom: spacing() }} />
        <BrandInput label="Email" value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' style={{ marginBottom: spacing(2) }} />
        <View style={{ marginTop: 'auto', paddingBottom: spacing(2) }}>
          <Button mode="contained" onPress={onSave} loading={busy} contentStyle={{ paddingVertical: spacing(0.75) }}>Kaydi</Button>
        </View>
      </View>
    </ScreenWrapper>
  );
}
