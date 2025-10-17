import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, Pressable, Vibration } from 'react-native';
import { useTheme, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandFAB from '../../components/ui/BrandFAB';
import { spacing, Colors } from '../../theme';
import { listCustomers } from '../../repositories/customerRepo';
import { listProducts } from '../../repositories/productRepo';
import { listInvoices } from '../../repositories/invoiceRepo';
import { useCurrency } from '../../context/CurrencyContext';
import { totals as debtTotals } from '../../repositories/debtRepo';
import ScreenWrapper from '../../components/ui/ScreenWrapper';

function Tile({ colors, icon, title, subtitle, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  const handlePress = () => { try { Vibration.vibrate(10); } catch {} onPress?.(); };
  return (
    <Animated.View style={{ width: '48%', transform: [{ scale }], marginBottom: spacing(2) }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
        accessibilityRole="button"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: Colors.glow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
          backgroundColor: 'rgba(1,0,42,0.22)'
        }}
      >
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{
          paddingVertical: spacing(4),
          paddingHorizontal: spacing(2),
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120
        }}>
          <MaterialCommunityIcons name={icon} size={32} color="#fff" style={{ marginBottom: spacing() }} />
          <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', textAlign: 'center', fontSize: 16 }}>{title}</Text>
          {!!subtitle && <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 6, fontFamily: 'Poppins_500Medium', fontSize: 13 }}>{subtitle}</Text>}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function ManagementScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const { format } = useCurrency();
  const [counts, setCounts] = useState({ customers: 0, products: 0, invoices: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cs, ps, inv, d] = await Promise.all([
        listCustomers(''),
        listProducts(),
        listInvoices(),
        debtTotals(),
      ]);
      setCounts({ customers: cs.length, products: ps.length, invoices: inv.length, outstanding: Number(d.outstanding || 0) });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const cards = useMemo(() => ([
    {
      key: 'customers',
      title: 'Macamiisha',
      icon: 'account-heart-outline',
      colors: ['#01002a', '#fe3200'],
      subtitle: loading ? '…' : `${counts.customers} macamiil`,
      onPress: () => nav.navigate('ManageCustomers'),
    },
    {
      key: 'debts',
      title: 'Daymaha',
      icon: 'file-document-outline',
      colors: ['#01002a', '#fe3200'],
      subtitle: loading ? '…' : format(counts.outstanding),
      onPress: () => nav.navigate('ManageDebts'),
    },
    {
      key: 'inventory',
      title: 'Kaydka Alaabaha',
      icon: 'package-variant',
      colors: ['#01002a', '#fe3200'],
      subtitle: loading ? '…' : `${counts.products} alaab`,
      onPress: () => nav.navigate('ManageInventory'),
    },
    {
      key: 'invoices',
      title: 'Foomamka / Iibinta',
      icon: 'receipt',
      colors: ['#01002a', '#fe3200'],
      subtitle: loading ? '…' : `${counts.invoices} foom`,
      onPress: () => nav.navigate('ManageInvoices'),
    },
  ]), [counts, loading]);

  return (
    <ScreenWrapper backgroundColor={theme.colors.background}>
      <BrandHeader title="Maareynta Ganacsigaaga" subtitle="Dooro qeybta aad maareyneyso">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(), marginTop: spacing(1.5), marginBottom: spacing(1) }}>
          <Chip icon="account-plus" onPress={() => nav.navigate('CustomerForm')}>
            Ku dar macmiil
          </Chip>
          <Chip icon="plus" onPress={() => nav.navigate('ProductForm')}>
            Ku dar alaab
          </Chip>
          <Chip icon="file-plus" onPress={() => nav.navigate('ManageDebts')}>
            Ku dar dayn
          </Chip>
          <Chip icon="receipt" onPress={() => nav.navigate('ManageInvoices')}>
            Rasiid cusub
          </Chip>
        </View>
      </BrandHeader>

      {/* 2x2 Grid Layout */}
      <View style={{
        flex: 1,
        paddingHorizontal: spacing(2.5),
        paddingTop: spacing(2.5),
        paddingBottom: spacing(3),
      }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {cards.map(({ key, ...tileProps }) => (
            <Tile key={key} {...tileProps} />
          ))}
        </View>
        <Text style={{ color: Colors.mutedSurface, textAlign: 'center', fontFamily: 'Poppins_500Medium' }}>
          Hagaha degdega ah ee maamulka ganacsigaaga.
        </Text>
      </View>

      <BrandFAB
        icon="plus"
        style={{ position: 'absolute', right: spacing(2), bottom: spacing(2) }}
        onPress={() => nav.navigate('CustomerForm')}
        accessibilityLabel="Ku dar macmiil cusub"
      />
    </ScreenWrapper>
  );
}
