import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Button, Text, IconButton, Dialog, Portal, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BrandHeader from '../../../components/ui/BrandHeader';
import BrandCard from '../../../components/ui/BrandCard';
import BrandInput from '../../../components/ui/BrandInput';
import BrandFAB from '../../../components/ui/BrandFAB';
import { spacing, Colors } from '../../../theme';
import { listDebtsGroupedByCustomer, totals, upsertDebt, deleteDebt } from '../../../repositories/debtRepo';
import { useCurrency } from '../../../context/CurrencyContext';
import ScreenWrapper from '../../../components/ui/ScreenWrapper';

function DebtEditor({ visible, onDismiss, initial, defaultType = 'borrowed' }) {
  const [customerId, setCustomerId] = useState(initial?.customerId || '');
  const [amount, setAmount] = useState(String(initial?.amount ?? ''));
  const [dueDate, setDueDate] = useState(String(initial?.dueDate ? Math.floor(initial.dueDate/86400000) : ''));
  const [status, setStatus] = useState(initial?.status || 'pending');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [type, setType] = useState(initial?.type || defaultType); // 'borrowed' | 'owed'
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setCustomerId(initial?.customerId || '');
      setAmount(String(initial?.amount ?? ''));
      setDueDate(String(initial?.dueDate ? Math.floor(initial.dueDate/86400000) : ''));
      setStatus(initial?.status || 'pending');
      setNotes(initial?.notes || '');
      setType(initial?.type || defaultType);
    }
  }, [visible, initial]);

  const onSave = async () => {
    setBusy(true);
    try {
      const due = Number(dueDate || 0) * 86400000; // accept days from today if number
      const ts = due > 0 && due < 8640000000000 ? due : Date.now();
      await upsertDebt({ id: initial?.id, customerId: customerId || null, amount: Number(amount||0), dueDate: ts, status, notes, type });
      onDismiss(true);
    } finally { setBusy(false); }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => onDismiss(false)} style={{ backgroundColor: Colors.surface, borderRadius: 24 }}>
        <Dialog.Title style={{ fontFamily: 'Poppins_600SemiBold' }}>{initial?.id ? 'Wax ka beddel dayn' : 'Ku dar dayn'}</Dialog.Title>
        <Dialog.Content>
          <BrandInput label="Macmiil ID" value={customerId} onChangeText={setCustomerId} style={{ marginBottom: spacing() }} />
          <BrandInput label="Lacag " value={amount} onChangeText={setAmount} keyboardType='decimal-pad' style={{ marginBottom: spacing() }} />
          <BrandInput label="Due (maalmo)" value={dueDate} onChangeText={setDueDate} keyboardType='numeric' style={{ marginBottom: spacing() }} />
          <BrandInput label="Xaaladda (pending/paid/overdue)" value={status} onChangeText={setStatus} style={{ marginBottom: spacing() }} />
          <BrandInput label="Faallo" value={notes} onChangeText={setNotes} multiline style={{ marginBottom: spacing() }} />
          <View style={{ flexDirection: 'row', gap: spacing(), marginTop: spacing() }}>
            <Chip selected={type==='borrowed'} onPress={() => setType('borrowed')} style={{ flex: 1, justifyContent: 'center', backgroundColor: type==='borrowed' ? 'rgba(32,224,112,0.2)' : 'rgba(255,255,255,0.08)' }} textStyle={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}>
              Dayn laga amaahday
            </Chip>
            <Chip selected={type==='owed'} onPress={() => setType('owed')} style={{ flex: 1, justifyContent: 'center', backgroundColor: type==='owed' ? 'rgba(254,77,45,0.2)' : 'rgba(255,255,255,0.08)' }} textStyle={{ color: '#fff', fontFamily: 'Poppins_500Medium' }}>
              Deyn lagugu leeyahay
            </Chip>
          </View>
        </Dialog.Content>
        <Dialog.Actions style={{ paddingHorizontal: spacing(), paddingBottom: spacing() }}>
          <Button textColor={Colors.mutedSurface} onPress={() => onDismiss(false)} labelStyle={{ fontFamily: 'Poppins_500Medium' }}>Ka noqo</Button>
          <Button mode="contained" loading={busy} onPress={onSave} contentStyle={{ paddingVertical: spacing(0.75), paddingHorizontal: spacing(1.5) }} labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}>Kaydi</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export default function DebtsScreen() {
  const [groups, setGroups] = useState([]);
  const [summary, setSummary] = useState({ outstanding: 0, overdue: 0 });
  const [editor, setEditor] = useState({ open: false, debt: null });
  const [tab, setTab] = useState('borrowed'); // 'borrowed' | 'owed'
  const theme = useTheme();
  const { format } = useCurrency();

  const load = useCallback(async (kind = tab) => {
    const g = await listDebtsGroupedByCustomer(kind);
    const t = await totals(kind);
    setGroups(g);
    setSummary(t);
  }, [tab]);

  useEffect(() => { load(tab); }, [load, tab]);

  const TabButton = ({ value, icon, label }) => {
    const active = tab === value;
    return (
      <Button
        mode={active ? 'contained-tonal' : 'outlined'}
        icon={() => <MaterialCommunityIcons name={icon} size={18} color={active ? '#fff' : Colors.mutedSurface} />}
        onPress={() => setTab(value)}
        style={{ flex: 1, borderRadius: 18, borderColor: 'rgba(255,255,255,0.08)' }}
        buttonColor={active ? Colors.primary : 'transparent'}
        textColor={active ? '#fff' : Colors.mutedSurface}
        contentStyle={{ paddingVertical: spacing(0.75) }}
        labelStyle={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13 }}
      >
        {label}
      </Button>
    );
  };

  const renderGroup = ({ item }) => {
    const first = item.items?.[0];
    const dueTs = Number(first?.due_date || first?.dueDate || Date.now());
    const days = Math.max(0, Math.round((dueTs - Date.now())/86400000));
    const statusTone = (first?.status || 'pending') === 'paid' ? Colors.success : days === 0 ? Colors.danger : Colors.primary;
    const badgeText = (first?.status || 'pending') === 'paid' ? 'La bixiyay' : days === 0 ? 'Daah' : `${days} maalmood`; 

    return (
      <BrandCard
        border={false}
        style={{
          backgroundColor: 'rgba(1,0,42,0.22)',
          borderWidth: 1,
          borderColor: 'rgba(254,77,45,0.18)',
          marginBottom: spacing(1.5),
          padding: spacing(2),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(254,77,45,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: spacing(1.5) }}>
            <MaterialCommunityIcons name="account-cash-outline" size={26} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16 }}>{item.customerName}</Text>
            <Text style={{ color: Colors.mutedSurface, marginTop: spacing(0.25) }}>{`${item.items?.length || 0} x dayn • Wadarta ${format(item.total)}`}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ paddingHorizontal: spacing(1), paddingVertical: spacing(0.25), backgroundColor: statusTone, borderRadius: 999 }}>
              <Text style={{ color: '#050B16', fontFamily: 'Poppins_600SemiBold', fontSize: 11 }}>{badgeText}</Text>
            </View>
            <Text style={{ color: '#fff', marginTop: spacing(0.5), fontFamily: 'Poppins_700Bold' }}>{format(first?.amount || item.total)}</Text>
          </View>
        </View>

        {first?.notes ? (
          <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: spacing(1), fontSize: 12 }}>{first.notes}</Text>
        ) : null}

        <View style={{ flexDirection: 'row', marginTop: spacing(1.5), gap: spacing(1) }}>
          <Button
            mode="outlined"
            onPress={() => setEditor({ open: true, debt: { id: first?.id, customerId: item.customerId, amount: first?.amount, dueDate: first?.due_date, status: first?.status, notes: first?.notes, type: tab } })}
            icon="pencil"
            style={{ flex: 1, borderRadius: 16, borderColor: Colors.primary }}
            textColor={Colors.primary}
            contentStyle={{ paddingVertical: spacing(0.75) }}
            labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
          >
            Wax ka beddel
          </Button>
          <Button
            mode="contained"
            onPress={async () => { for (const d of item.items) { await deleteDebt(d.id); } await load(); }}
            icon="delete"
            style={{ flex: 1, borderRadius: 16, backgroundColor: Colors.danger }}
            contentStyle={{ paddingVertical: spacing(0.75) }}
            labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
          >
            Tirtir
          </Button>
        </View>
      </BrandCard>
    );
  };

  const renderEmpty = () => (
    <View style={{ alignItems: 'center', marginTop: spacing(6) }}>
      <View style={{ width: 82, height: 82, borderRadius: 28, backgroundColor: 'rgba(254,77,45,0.18)', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="playlist-remove" size={36} color={Colors.primary} />
      </View>
      <Text style={{ marginTop: spacing(1.5), fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16 }}>Ma jiro dayn weli.</Text>
      <Text style={{ marginTop: spacing(0.75), color: Colors.mutedSurface, textAlign: 'center', paddingHorizontal: spacing(4) }}>
        Ku dar dayn cusub si aad ula socoto deynta laga amaahday ama lagugu leeyahay.
      </Text>
      <Button
        mode="contained"
        icon="plus"
        onPress={() => setEditor({ open: true, debt: { type: tab } })}
        style={{ marginTop: spacing(2), borderRadius: 18 }}
        contentStyle={{ paddingVertical: spacing(0.9), paddingHorizontal: spacing(2) }}
        labelStyle={{ fontFamily: 'Poppins_600SemiBold' }}
      >
        Ku dar dayn
      </Button>
    </View>
  );

  return (
    <ScreenWrapper backgroundColor={theme.colors.background}>
      <BrandHeader title="Daymaha">
        <View style={{ flexDirection: 'row', gap: spacing(1), marginBottom: spacing(1) }}>
          <TabButton value="borrowed" icon="handshake-outline" label="Deyn laga amaahday" />
          <TabButton value="owed" icon="cash-refund" label="Deynta lagugu leeyahay" />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing(1) }}>
          <BrandCard border={false} style={{ flex: 1, backgroundColor: 'rgba(32,224,112,0.18)', borderRadius: 20, paddingVertical: spacing(1.5), paddingHorizontal: spacing(1.5) }}>
            <Text style={{ color: '#0a1f4b', fontFamily: 'Poppins_500Medium', fontSize: 13 }}>Hadhka guud</Text>
            <Text style={{ color: '#050B16', fontFamily: 'Poppins_700Bold', fontSize: 18, marginTop: spacing(0.5) }}>{format(summary.outstanding)}</Text>
          </BrandCard>
          <BrandCard border={false} style={{ flex: 1, backgroundColor: 'rgba(254,77,45,0.18)', borderRadius: 20, paddingVertical: spacing(1.5), paddingHorizontal: spacing(1.5) }}>
            <Text style={{ color: '#0a1f4b', fontFamily: 'Poppins_500Medium', fontSize: 13 }}>Dib u dhac</Text>
            <Text style={{ color: '#050B16', fontFamily: 'Poppins_700Bold', fontSize: 18, marginTop: spacing(0.5) }}>{format(summary.overdue)}</Text>
          </BrandCard>
        </View>
      </BrandHeader>

      <View style={{ flex: 1, paddingHorizontal: spacing(2.5), paddingTop: spacing(2) }}>
        <FlatList
          data={groups}
          keyExtractor={(g) => g.customerId}
          contentContainerStyle={{ paddingBottom: spacing(12), paddingTop: spacing(1) }}
          renderItem={renderGroup}
          ListEmptyComponent={renderEmpty}
        />
      </View>

      <DebtEditor
        visible={editor.open}
        initial={editor.debt}
        defaultType={tab}
        onDismiss={async (saved) => { setEditor({ open: false, debt: null }); if (saved) await load(); }}
      />

      <BrandFAB
        icon="plus"
        buttonColor={tab === 'borrowed' ? Colors.primary : Colors.success}
        onPress={() => setEditor({ open: true, debt: { type: tab } })}
      />
    </ScreenWrapper>
  );
}
