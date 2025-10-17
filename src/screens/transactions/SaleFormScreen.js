import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Text, TextInput, Switch } from 'react-native-paper';
import { spacing, Colors } from '../../theme';
import BarcodeScannerModal from '../../components/BarcodeScannerModal';
import { ensureBySku, getProductBySku } from '../../repositories/productRepo';
import { addSale } from '../../repositories/transactionRepo';
import { notifyLowStock } from '../../services/notify/localNotifications';
import { createFromSale } from '../../repositories/invoiceRepo';
import { schedulePaymentReminder } from '../../services/notify/localNotifications';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandInput from '../../components/ui/BrandInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

export default function SaleFormScreen({ navigation, route }) {
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(route?.params?.initPaid ?? true);
  const [scan, setScan] = useState(false);
  const [info, setInfo] = useState(null);
  const [dueDays, setDueDays] = useState('7');
  const [customerId, setCustomerId] = useState('');

  const fetch = async (code) => {
    const p = await ensureBySku(code);
    setSku(p.sku);
    setPrice(String(p.price || ''));
    setInfo(p);
  };

  const onSave = async () => {
    setBusy(true);
    try {
      const p = await ensureBySku(sku.trim());
      await addSale({ productId: p.id, qty: Number(qty || 1), price: Number(price || 0), paid, customerId: customerId || null });
      const remaining = (info?.stock || 0) - Number(qty || 1);
      if (remaining <= 5) {
        notifyLowStock({ name: info?.name || 'Alaab', stock: remaining }).catch(()=>{});
      }
      if (!paid) {
        const sale = { price: Number(price || 0), qty: Number(qty || 1), productName: info?.name };
        const dueDate = Date.now() + Number(dueDays || 7) * 86400000;
        const invoiceId = await createFromSale({ sale, customer: customerId ? { id: customerId } : null, dueDate });
        await schedulePaymentReminder({ invoiceId, when: new Date(dueDate), amount: sale.price * sale.qty });
      }
      navigation.goBack();
    } finally { setBusy(false); }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title="Ku dar iib" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(3) }}>
        <BrandInput label="SKU / Baar-koodh" value={sku} onChangeText={setSku} right={<TextInput.Icon icon="barcode" onPress={() => setScan(true)} />} style={{ marginBottom: spacing() }} />
        <BrandInput label="Tirada" value={qty} onChangeText={setQty} keyboardType='numeric' style={{ marginBottom: spacing() }} />
        <BrandInput label="Qiimaha (hal shay)" value={price} onChangeText={setPrice} keyboardType='decimal-pad' style={{ marginBottom: spacing(2) }} />
        {info && <Text style={{ marginBottom: spacing(2) }}>Alaab: {info.name} | Kaydka: {info.stock}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(2) }}>
          <Switch value={paid} onValueChange={setPaid} /><Text style={{ marginLeft: 8 }}>Lacagta waa la bixiyay</Text>
        </View>
        {!paid && (
          <BrandInput label="Maalmo ka dib ee bixinta" value={dueDays} onChangeText={setDueDays} keyboardType='numeric' style={{ marginBottom: spacing(2) }} />
        )}
        <BrandInput label="Macmiil ID (Ikhtiyaari)" value={customerId} onChangeText={setCustomerId} autoCapitalize='none' style={{ marginBottom: spacing(2) }} />
        <Button mode="contained" onPress={onSave} loading={busy} contentStyle={{ paddingVertical: spacing(0.75) }}>Kaydi iibka</Button>
      </ScrollView>
      <BarcodeScannerModal visible={scan} onClose={() => setScan(false)} onScanned={(code) => { fetch(code); setScan(false); }} />
    </ScreenWrapper>
  );
}
