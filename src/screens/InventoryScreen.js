import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, List, IconButton, useTheme } from 'react-native-paper';
import { spacing, Colors } from '../theme';
import BrandHeader from '../components/ui/BrandHeader';
import BrandInput from '../components/ui/BrandInput';
import BrandCard from '../components/ui/BrandCard';
import BrandFAB from '../components/ui/BrandFAB';
import { listProducts } from '../repositories/productRepo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCurrency } from '../context/CurrencyContext';
import RoleGate from '../components/RoleGate';

export default function InventoryScreen({ embedded = false }) {
  const nav = useNavigation();
  const { format } = useCurrency();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const rows = await listProducts();
    setItems(rows);
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const filtered = items.filter(p => (p.name||'').toLowerCase().includes(search.toLowerCase()) || (p.sku||'').toLowerCase().includes(search.toLowerCase()))

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {embedded ? (
        <View style={{ padding: spacing(2) }}>
          <BrandInput placeholder="Ka raadi alaabta..." mode='outlined' value={search} onChangeText={setSearch} />
        </View>
      ) : (
        <BrandHeader title="Kaydka">
          <BrandInput placeholder="Ka raadi alaabta..." mode='outlined' value={search} onChangeText={setSearch} />
        </BrandHeader>
      )}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing(2), marginTop: spacing() }}>
            <BrandCard onPress={() => nav.navigate('ProductForm', { product: item })}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: spacing() }}>
                  <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold' }}>{(item.name||'?').slice(0,2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{item.name}</Text>
                  <Text style={{ color: Colors.mutedSurface }}>{`SKU: ${item.sku}  | Kaydka: ${item.stock}`}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ alignSelf: 'center', color: Colors.primary, marginRight: 8 }}>{format(item.price)}</Text>
                  <RoleGate allow={['admin','accountant']}>
                    <IconButton icon="pencil" onPress={() => nav.navigate('ProductForm', { product: item })} />
                  </RoleGate>
                </View>
              </View>
            </BrandCard>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: spacing(2) }}>Ma jiro alaab weli.</Text>}
      />
      <RoleGate allow={['admin','accountant']}>
        <BrandFAB icon="plus" onPress={() => nav.navigate('ProductForm')} />
      </RoleGate>
    </View>
  );
}
