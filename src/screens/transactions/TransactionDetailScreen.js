import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { ActivityIndicator, Button, Text, IconButton, useTheme, Portal, Dialog, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandCard from '../../components/ui/BrandCard';
import BrandInput from '../../components/ui/BrandInput';
import { spacing, Colors } from '../../theme';
import { useCurrency } from '../../context/CurrencyContext';
import { deleteTransaction, getTransactionById, updateTransaction } from '../../repositories/transactionRepo';
import { generateTransactionPdf, sharePdf } from '../../services/pdf/pdfService';

export default function TransactionDetailScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const route = useRoute();
  const { format } = useCurrency();
  const id = route.params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tx, setTx] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ amount: '', qty: '1', currency: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getTransactionById(id);
      setTx(data);
      if (data) {
        setForm({
          amount: String(data.amount || 0),
          qty: String(data.qty || 1),
          currency: data.currency || '',
        });
      }
    } catch (e) {
      Alert.alert('Qalad', 'Ma awoodin in xogta xawaaladda la akhriyo.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const typeBadge = useMemo(() => {
    if (!tx) return null;
    const isSale = tx.type === 'sale';
    return {
      label: isSale ? 'Iib' : 'Kharash',
      backgroundColor: isSale ? 'rgba(32,224,112,0.16)' : 'rgba(255,92,112,0.16)',
      color: isSale ? Colors.success : Colors.danger,
    };
  }, [tx]);

  const handleShare = useCallback(async () => {
    try {
      if (!tx) return;
      const uri = await generateTransactionPdf(tx);
      await sharePdf(uri);
    } catch (e) {
      Alert.alert('Qalad', 'Ma suurtogelin in PDF la diyaariyo.');
    }
  }, [tx]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updated = await updateTransaction({
        id,
        amount: Number(form.amount || 0),
        qty: Number(form.qty || 1),
        currency: form.currency,
      });
      setTx(updated);
      setEditMode(false);
      Alert.alert('Guul', 'Xisaabaadka waa la cusbooneysiiyay.');
    } catch (e) {
      Alert.alert('Qalad', e.message || 'Ma suurtogelin in la cusbooneysiiyo.');
    } finally {
      setSaving(false);
    }
  }, [form.amount, form.currency, form.qty, id]);
  const handleDelete = useCallback(async () => {
    try {
      setConfirmOpen(false);
      const success = await deleteTransaction(id);
      if (success) {
        Alert.alert('La tiray', 'Xisaabaadka waa la tiray.');
        nav.goBack();
      }
    } catch (e) {
    }
  }, [id, nav]);

  if (loading) {
    return (
      <ScreenWrapper backgroundColor={Colors.background}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      </ScreenWrapper>
    );
  }

  if (!tx) {
    return (
      <ScreenWrapper backgroundColor={Colors.background}>
        <BrandHeader title="Xisaabaad" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(3) }}>
          <Text style={{ color: Colors.mutedSurface }}>Xogtan lama helin ama waa la tirtiray.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title="Xisaabaad" subtitle={`ID: ${tx.id.slice(0, 8)}...`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingBottom: spacing(4), gap: spacing(2) }}>
        <BrandCard border={false} style={{ borderRadius: 24, backgroundColor: 'rgba(1,0,42,0.24)', padding: spacing(2) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 18 }}>{typeBadge?.label}</Text>
              <Text style={{ color: Colors.mutedSurface, marginTop: spacing(0.5) }}>{new Date(tx.created_at).toLocaleString()}</Text>
            </View>
            <View style={{ paddingHorizontal: spacing(1.5), paddingVertical: spacing(0.5), borderRadius: 20, backgroundColor: typeBadge?.backgroundColor }}>
              <Text style={{ color: typeBadge?.color, fontFamily: 'Poppins_600SemiBold' }}>{format(Math.abs(tx.amount || 0))}</Text>
            </View>
          </View>
        </BrandCard>

        <BrandCard border={false} style={{ borderRadius: 24, backgroundColor: 'rgba(1,0,42,0.18)', padding: spacing(2) }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing(1) }}>Faahfaahin</Text>
          {tx.product && (
            <View style={{ marginBottom: spacing(0.75) }}>
              <Text style={{ color: Colors.mutedSurface }}>Alaab</Text>
              <Text style={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}>{tx.product.name}</Text>
            </View>
          )}
          {tx.customer && (
            <View style={{ marginBottom: spacing(0.75) }}>
              <Text style={{ color: Colors.mutedSurface }}>Macmiil</Text>
              <Text style={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}>{tx.customer.name}</Text>
            </View>
          )}
          <View style={{ marginBottom: spacing(0.75) }}>
            <Text style={{ color: Colors.mutedSurface }}>Qiimaha</Text>
            <Text style={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}>{format(tx.amount)}</Text>
          </View>
          <View style={{ marginBottom: spacing(0.75) }}>
            <Text style={{ color: Colors.mutedSurface }}>Tirada</Text>
            <Text style={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}>{tx.qty}</Text>
          </View>
          <View>
            <Text style={{ color: Colors.mutedSurface }}>Lacagta</Text>
            <Text style={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}>{tx.currency}</Text>
          </View>
        </BrandCard>

        <BrandCard border={false} style={{ borderRadius: 24, backgroundColor: 'rgba(1,0,42,0.18)', padding: spacing(2) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(1) }}>
            <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold' }}>Wax ka beddel</Text>
            <IconButton icon={editMode ? 'close' : 'pencil'} iconColor={Colors.mutedSurface} onPress={() => setEditMode((v) => !v)} />
          </View>
          {editMode ? (
            <View style={{ gap: spacing(1.5) }}>
              <BrandInput label="Qiimaha" value={form.amount} onChangeText={(v) => setForm((p) => ({ ...p, amount: v }))} keyboardType="decimal-pad" />
              <BrandInput label="Tirada" value={form.qty} onChangeText={(v) => setForm((p) => ({ ...p, qty: v }))} keyboardType="numeric" />
              <BrandInput label="Lacagta" value={form.currency} onChangeText={(v) => setForm((p) => ({ ...p, currency: v }))} autoCapitalize="characters" />
              <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>
                Kaydi isbeddelka
              </Button>
            </View>
          ) : (
            <Text style={{ color: Colors.mutedSurface }}>Gali hab wax ka beddel si aad u cusbooneysiiso qiimaha, tirada ama lacagta.</Text>
          )}
        </BrandCard>

        <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1) }}>
          <Button mode="outlined" icon="share-variant" onPress={handleShare} style={{ flex: 1 }}>
            La wadaag PDF
          </Button>
          <Button mode="contained" buttonColor={Colors.danger} textColor="#fff" icon="delete" onPress={() => setConfirmOpen(true)} style={{ flex: 1 }}>
            Tirtir
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={confirmOpen} onDismiss={() => setConfirmOpen(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 20 }}>
          <Dialog.Title style={{ fontFamily: 'Poppins_600SemiBold' }}>Tirtir xisaabaadka?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: Colors.mutedSurface }}>Tani waa fal aan la noqon karin. Ma hubtaa?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmOpen(false)} textColor={Colors.mutedSurface}>Jooji</Button>
            <Button onPress={handleDelete} textColor={Colors.danger}>Tirtir</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}
