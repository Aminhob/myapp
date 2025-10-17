import React, { useCallback, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { spacing, Colors } from '../theme';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { listRecentTransactions } from '../repositories/transactionRepo';
import { ensureBySku } from '../repositories/productRepo';
import { quickSale } from '../repositories/transactionRepo';
import { useCurrency } from '../context/CurrencyContext';
import RoleGate from '../components/RoleGate';
import BrandHeader from '../components/ui/BrandHeader';
import BrandCard from '../components/ui/BrandCard';

export default function TransactionsScreen() {
  const nav = useNavigation();
  const { format } = useCurrency();
  const [scanOpen, setScanOpen] = useState(false);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const rows = await listRecentTransactions(50);
    setItems(rows);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onScanned = async (code) => {
    try {
      const product = await ensureBySku(code);
      if (Number(product.price) > 0) {
        await quickSale({ product, qty: 1 });
      } else {
        nav.navigate('ProductForm', { product });
      }
      await load();
    } finally {
      setScanOpen(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Xisaabaadka">
        <RoleGate allow={['admin','sales','accountant']}>
          <Button mode="contained" style={{ marginBottom: spacing() }} onPress={() => nav.navigate('SaleForm')}>Ku dar iib</Button>
        </RoleGate>
        <RoleGate allow={['admin','accountant']}>
          <Button mode="contained" style={{ marginBottom: spacing() }} onPress={() => nav.navigate('ExpenseForm')}>Ku dar kharash</Button>
        </RoleGate>
        <Button mode="outlined" onPress={() => setScanOpen(true)}>Isku xirka Baar-koodhka</Button>
      </BrandHeader>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => nav.navigate('TransactionDetail', { id: item.id })} activeOpacity={0.85}>
            <View style={{ paddingHorizontal: spacing(2), marginTop: spacing() }}>
              <BrandCard>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: item.type==='sale' ? 'rgba(0,200,81,0.12)' : 'rgba(230,57,70,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: spacing() }}>
                    <Text style={{ color: item.type==='sale' ? Colors.success : Colors.danger }}>{item.type==='sale' ? '↑' : '↓'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{item.type === 'sale' ? 'Iib' : 'Kharash'}</Text>
                    <Text style={{ color: Colors.mutedSurface }}>{new Date(item.created_at).toLocaleString()}</Text>
                  </View>
                  <Text style={{ alignSelf: 'center', color: item.type==='sale' ? Colors.success : Colors.danger, fontFamily: 'Poppins_600SemiBold' }}>
                    {item.type==='sale' ? '+' : '-'}{format(Math.abs(item.amount))}
                  </Text>
                </View>
              </BrandCard>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={<Text style={{ margin: spacing(2), fontFamily: 'Poppins_600SemiBold' }}>Wax ka beddel dhawaan</Text>}
        ListEmptyComponent={
          <View style={{ padding: spacing(3), alignItems: 'center' }}>
            <Text style={{ color: Colors.mutedSurface, marginBottom: spacing() }}>Wax xisaabaad ma jiraan weli.</Text>
            <Button mode="outlined" onPress={() => nav.navigate('SaleForm')}>Ku dar iib</Button>
          </View>
        }
      />

      <BarcodeScannerModal visible={scanOpen} onClose={() => setScanOpen(false)} onScanned={onScanned} />
    </View>
  );
}
