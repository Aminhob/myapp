import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Text, TextInput, Divider } from 'react-native-paper';
import { spacing, Colors } from '../../theme';
import { upsertProduct } from '../../repositories/productRepo';
import BarcodeScannerModal from '../../components/BarcodeScannerModal';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandInput from '../../components/ui/BrandInput';
import { quickSale } from '../../repositories/transactionRepo';
import { useCurrency } from '../../context/CurrencyContext';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

export default function ProductFormScreen({ route, navigation }) {
  const editing = route.params?.product || null;
  const initialSaleRequested = route.params?.initialSale === true;
  const presetSku = editing?.sku || route.params?.initialSku || '';
  const [name, setName] = useState(editing?.name || '');
  const [sku, setSku] = useState(presetSku);
  const [price, setPrice] = useState(String(editing?.price ?? ''));
  const [stock, setStock] = useState(String(editing?.stock ?? '0'));
  const [qty, setQty] = useState('1');
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState(false);
  const [savingOnly, setSavingOnly] = useState(!initialSaleRequested);
  const { format } = useCurrency();

  const totalPrice = useMemo(() => {
    const p = Number(price || 0);
    const q = Number(qty || 1);
    if (!Number.isFinite(p) || !Number.isFinite(q)) return '0';
    return format(p * q);
  }, [price, qty, format]);

  const onSave = async () => {
    setBusy(true);
    try {
      const productId = await upsertProduct({ id: editing?.id, name, sku, price: Number(price || 0), stock: Number(stock || 0) });
      if (!savingOnly) {
        await quickSale({ product: { id: productId, price: Number(price || 0) }, qty: Number(qty || 1) });
      }
      navigation.goBack();
    } finally { setBusy(false); }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title={editing ? 'Wax ka beddel Alaab' : 'Alaab Cusub'} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(3) }}>
        <BrandInput label="Magaca Alaabta" value={name} onChangeText={setName} style={{ marginBottom: spacing() }} />
        <BrandInput label="SKU / Baar-koodh" value={sku} onChangeText={setSku} right={<TextInput.Icon icon="barcode" onPress={() => setScan(true)} />} style={{ marginBottom: spacing() }} />
        <Button mode="outlined" style={{ marginBottom: spacing() }} onPress={() => setScan(true)}>Isticmaal Kamarada si aad u akhrido</Button>
        <BrandInput label="Qiimaha" value={price} onChangeText={setPrice} keyboardType='decimal-pad' style={{ marginBottom: spacing() }} />
        <BrandInput label="Kaydka" value={stock} onChangeText={setStock} keyboardType='numeric' style={{ marginBottom: spacing(2) }} />
        {!editing && (
          <>
            <Divider style={{ marginBottom: spacing() }} />
            <Text style={{ marginBottom: spacing(0.5), fontFamily: 'Poppins_600SemiBold' }}>Iib degdeg ah ka dib kaydinta?</Text>
            <BrandInput label="Tirada la iibinayo" value={qty} onChangeText={setQty} keyboardType='numeric' style={{ marginBottom: spacing() }} />
            <View style={{ flexDirection: 'row', gap: spacing(), marginBottom: spacing() }}>
              <Button
                mode={savingOnly ? 'contained' : 'outlined'}
                onPress={() => setSavingOnly(true)}
                style={{ flex: 1 }}
              >
                Kaliya kaydi
              </Button>
              <Button
                mode={!savingOnly ? 'contained' : 'outlined'}
                onPress={() => setSavingOnly(false)}
                style={{ flex: 1 }}
                disabled={Number(price || 0) <= 0}
              >
                Kaydi oo iibso
              </Button>
            </View>
            {!savingOnly && (
              <Text style={{ marginBottom: spacing(), color: 'rgba(255,255,255,0.7)' }}>Wadarta iibka: {totalPrice}</Text>
            )}
          </>
        )}
        <Button
          mode="contained"
          onPress={onSave}
          loading={busy}
          disabled={!name || !sku}
          contentStyle={{ paddingVertical: spacing(0.75) }}
        >
          Kaydi
        </Button>
      </ScrollView>
      <BarcodeScannerModal visible={scan} onClose={() => setScan(false)} onScanned={(code) => { setSku(code); setScan(false); }} />
    </ScreenWrapper>
  );
}
