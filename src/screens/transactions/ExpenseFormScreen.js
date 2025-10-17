import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { spacing } from '../../theme';
import { addExpense } from '../../repositories/transactionRepo';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandInput from '../../components/ui/BrandInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

export default function ExpenseFormScreen({ navigation }) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    setBusy(true);
    try {
      await addExpense({ amount: Number(amount || 0), label: label?.trim() || 'Kharash' });
      navigation.goBack();
    } finally { setBusy(false); }
  };

  return (
    <ScreenWrapper backgroundColor="#050B16">
      <BrandHeader title="Ku dar kharash" />
      <View style={{ flex: 1, paddingHorizontal: spacing(2.5), paddingTop: spacing(2) }}>
        <BrandInput label="Magaca kharashka" value={label} onChangeText={setLabel} style={{ marginBottom: spacing(2) }} />
        <BrandInput label="Kharash " value={amount} onChangeText={setAmount} keyboardType='decimal-pad' style={{ marginBottom: spacing(2) }} />
        <View style={{ marginTop: 'auto', paddingBottom: spacing(2) }}>
          <Button mode="contained" onPress={onSave} loading={busy} contentStyle={{ paddingVertical: spacing(0.75) }}>Kaydi kharashka</Button>
        </View>
      </View>
    </ScreenWrapper>
  );
}
