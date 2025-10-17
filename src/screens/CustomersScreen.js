import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Chip, useTheme, Button, TextInput } from 'react-native-paper';
import { spacing, Colors } from '../theme';
import BrandHeader from '../components/ui/BrandHeader';
import BrandInput from '../components/ui/BrandInput';
import BrandCard from '../components/ui/BrandCard';
import BrandFAB from '../components/ui/BrandFAB';
import { listCustomers } from '../repositories/customerRepo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/ui/ScreenWrapper';

export default function CustomersScreen({ embedded = false }) {
  const nav = useNavigation();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const rows = await listCustomers(search);
    setItems(rows);
  }, [search]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const Container = embedded ? View : ScreenWrapper;
  const containerProps = embedded ? { style: { flex: 1, backgroundColor: theme.colors.background } } : { backgroundColor: theme.colors.background };

  const renderEmpty = () => (
    <View style={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(6) }}>
      <BrandCard border style={{ backgroundColor: 'rgba(1,0,42,0.18)', alignItems: 'center', paddingVertical: spacing(3) }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(254,50,0,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing(1.5) }}>
          <Text style={{ color: Colors.primary, fontSize: 28, fontFamily: 'Poppins_700Bold' }}>👥</Text>
        </View>
        <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 16, marginBottom: spacing(0.5) }}>Ma jiro macmiil weli.</Text>
        <Text style={{ color: Colors.mutedSurface, textAlign: 'center', marginBottom: spacing(2) }}>Ku dar macmiilkii ugu horreeyay si aad uga bilaabato diiwaangelinta macaamiishaada.</Text>
        <Button mode="contained" icon="account-plus" onPress={() => nav.navigate('CustomerForm')} contentStyle={{ paddingVertical: spacing(0.75) }} labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}>
          Ku dar macmiil
        </Button>
      </BrandCard>
    </View>
  );

  return (
    <Container {...containerProps}>
      {embedded ? (
        <View style={{ paddingHorizontal: spacing(2.5), paddingVertical: spacing(2) }}>
          <BrandInput
            placeholder="Raadi macmiil..."
            value={search}
            onChangeText={setSearch}
            mode='outlined'
            left={<TextInput.Icon icon="magnify" color={Colors.mutedSurface} />}
            style={{ backgroundColor: 'rgba(1,0,42,0.05)' }}
          />
        </View>
      ) : (
        <BrandHeader title="Macaamiisha">
          <BrandInput
            placeholder="Raadi macmiil..."
            value={search}
            onChangeText={setSearch}
            mode='outlined'
            left={<TextInput.Icon icon="magnify" color={Colors.mutedSurface} />}
            style={{ backgroundColor: 'rgba(1,0,42,0.05)' }}
          />
        </BrandHeader>
      )}
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing(2.5), marginTop: spacing() }}>
            <BrandCard onPress={() => nav.navigate('CustomerForm', { customer: item })}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: spacing() }}>
                  <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold' }}>{(item.name||'?').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#fff' }}>{item.name}</Text>
                  <Text style={{ color: Colors.mutedSurface }}>{`${item.phone || ''}${item.email ? '  |  ' + item.email : ''}`}</Text>
                </View>
                <Chip
                  compact
                  style={{ backgroundColor: 'rgba(1,0,42,0.3)' }}
                  textStyle={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}
                >
                  {item.balance > 0 ? `Dayn: ${item.balance}` : 'Fiiqi'}
                </Chip>
              </View>
            </BrandCard>
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: spacing(12) }}
      />
      <BrandFAB icon="plus" onPress={() => nav.navigate('CustomerForm')} />
    </Container>
  );
}
