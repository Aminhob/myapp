import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';
import { spacing, Colors } from '../../theme';
import { listInvoices, getInvoice } from '../../repositories/invoiceRepo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCurrency } from '../../context/CurrencyContext';
import { generateInvoicePdf, sharePdf } from '../../services/pdf/pdfService';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandCard from '../../components/ui/BrandCard';
import BrandFAB from '../../components/ui/BrandFAB';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function InvoiceListScreen({ embedded = false }) {
  const nav = useNavigation();
  const { format } = useCurrency();
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const rows = await listInvoices();
    setItems(rows);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onShare = async (id) => {
    const inv = await getInvoice(id);
    if (!inv) return;
    const uri = await generateInvoicePdf({ customer: { name: inv.customer_id || '' }, items: inv.items, total: inv.total });
    await sharePdf(uri);
  };

  const edges = embedded ? ['left', 'right'] : undefined;
  const Container = embedded ? View : ScreenWrapper;
  const containerProps = embedded ? { style: { flex: 1, backgroundColor: Colors.background } } : { backgroundColor: Colors.background, edges };

  const renderEmpty = () => (
    <View style={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(6) }}>
      <BrandCard border style={{ alignItems: 'center', paddingVertical: spacing(3), backgroundColor: 'rgba(1,0,42,0.18)' }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(254,50,0,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing(1.5) }}>
          <MaterialCommunityIcons name="receipt" size={32} color={Colors.primary} />
        </View>
        <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 16, marginBottom: spacing(0.5) }}>Ma jiraan fatuurro weli.</Text>
        <Text style={{ color: Colors.mutedSurface, textAlign: 'center', marginBottom: spacing(2) }}>Ku dar fatuur ama iib si aad u aragto faahfaahinta halkan.</Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => nav.navigate('SaleForm', { initPaid: false })}
          contentStyle={{ paddingVertical: spacing(0.75) }}
          labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          Ku dar rasiid
        </Button>
      </BrandCard>
    </View>
  );

  return (
    <Container {...containerProps}>
      {!embedded && <BrandHeader title="Rasiidyo" />}
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing(2.5), marginTop: spacing() }}>
            <BrandCard onPress={() => nav.navigate('InvoiceDetail', { id: item.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{`#${item.id.slice(0,6)} - ${item.status}`}</Text>
                  <Text style={{ color: Colors.muted }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={{ alignSelf: 'center', color: Colors.primary, marginRight: 4 }}>{format(item.total)}</Text>
                <IconButton icon="share-variant" onPress={() => onShare(item.id)} />
              </View>
            </BrandCard>
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: spacing(10), paddingTop: embedded ? spacing(2) : spacing(3) }}
      />
      {!embedded && (
        <BrandFAB icon="plus" onPress={() => nav.navigate('SaleForm', { initPaid: false })} />
      )}
    </Container>
  );
}
