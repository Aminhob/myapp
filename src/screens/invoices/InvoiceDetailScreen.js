import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, DataTable, Text } from 'react-native-paper';
import { spacing, Colors } from '../../theme';
import { getInvoice } from '../../repositories/invoiceRepo';
import { generateInvoicePdf, sharePdf } from '../../services/pdf/pdfService';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandCard from '../../components/ui/BrandCard';
import { useCurrency } from '../../context/CurrencyContext';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

export default function InvoiceDetailScreen({ route }) {
  const { id } = route.params;
  const [inv, setInv] = useState(null);
  const [busy, setBusy] = useState(false);
  const { format } = useCurrency();

  const load = useCallback(async () => {
    const data = await getInvoice(id);
    setInv(data);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const onPdf = async () => {
    if (!inv) return;
    setBusy(true);
    try {
      const uri = await generateInvoicePdf({ customer: { name: inv.customer_id || '' }, items: inv.items, total: inv.total });
      await sharePdf(uri);
    } finally { setBusy(false); }
  };

  if (!inv) return null;

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <BrandHeader title={`Rasiid: #${id.slice(0,6)}`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(3) }}>
        <BrandCard>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Alaab</DataTable.Title>
              <DataTable.Title numeric>Qiime</DataTable.Title>
              <DataTable.Title numeric>Tiro</DataTable.Title>
              <DataTable.Title numeric>Wadarta</DataTable.Title>
            </DataTable.Header>
            {(inv.items||[]).map((it) => (
              <DataTable.Row key={it.id}>
                <DataTable.Cell>{it.name}</DataTable.Cell>
                <DataTable.Cell numeric>{format(it.price)}</DataTable.Cell>
                <DataTable.Cell numeric>{it.qty}</DataTable.Cell>
                <DataTable.Cell numeric>{format(it.price * it.qty)}</DataTable.Cell>
              </DataTable.Row>
            ))}
            <DataTable.Row>
              <DataTable.Cell numeric style={{ flex: 1 }}></DataTable.Cell>
              <DataTable.Cell numeric style={{ flex: 1 }}></DataTable.Cell>
              <DataTable.Cell numeric style={{ flex: 1 }}>Wadarta</DataTable.Cell>
              <DataTable.Cell numeric style={{ flex: 1 }}>{format(Number(inv.total || 0))}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </BrandCard>

        <Button mode="contained" onPress={onPdf} loading={busy} style={{ marginTop: spacing(2) }} contentStyle={{ paddingVertical: spacing(0.75) }}>Soo saar PDF</Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
