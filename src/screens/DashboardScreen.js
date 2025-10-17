import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, Animated, Easing, StyleSheet } from 'react-native';
import { Text, Button, useTheme, FAB, Snackbar, Portal, Dialog, TextInput, TouchableRipple, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import CardStat from '../components/CardStat';
import BrandCard from '../components/ui/BrandCard';
import { useCurrency } from '../context/CurrencyContext';
import { listRecentTransactions } from '../repositories/transactionRepo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { getProductBySku, getProductById } from '../repositories/productRepo';
import { quickSale } from '../repositories/transactionRepo';

export default function DashboardScreen() {
  const nav = useNavigation();
  const { format } = useCurrency();
  const [items, setItems] = useState([]);
  const theme = useTheme();
  const { profile } = useAuth?.() || {};
  const [scannerVisible, setScannerVisible] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [saleProduct, setSaleProduct] = useState(null);
  const [saleQty, setSaleQty] = useState('1');
  const scanningRef = useRef(false);
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const load = useCallback(async () => {
    const rows = await listRecentTransactions(10);
    setItems(rows);
  }, []);

  useEffect(() => {
    if (scannerVisible) {
      scanningRef.current = false;
    }
  }, [scannerVisible]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const income = items.filter(i=>i.type==='sale').reduce((s,i)=>s+Number(i.amount||0),0);
  const expense = items.filter(i=>i.type==='expense').reduce((s,i)=>s+Number(i.amount||0),0);
  const balance = income - expense;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const normalizeSku = (v) => String(v || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

  const showMessage = useCallback((message) => {
    setSnackbar({ visible: true, message });
  }, []);

  const dismissMessage = useCallback(() => {
    setSnackbar({ visible: false, message: '' });
  }, []);

  const saleTotal = useMemo(() => {
    const qty = Number(saleQty || 1);
    const price = Number(saleProduct?.price || 0);
    if (!Number.isFinite(qty) || !Number.isFinite(price)) return format(0);
    return format(qty * price);
  }, [saleQty, saleProduct, format]);

  const cancelSalePrompt = useCallback(() => {
    setSaleProduct(null);
    setSaleQty('1');
    scanningRef.current = false;
  }, []);

  const proceedSale = useCallback(async (product, qtyInput) => {
    try {
      const quantity = Math.max(1, Number(qtyInput || 1));
      if (!Number.isFinite(quantity) || quantity <= 0) {
        showMessage('Fadlan geli tiro sax ah.');
        return;
      }

      const latest = await getProductById(product.id);
      const price = Number(latest?.price ?? product.price ?? 0);
      const available = Number(latest?.stock ?? product.stock ?? 0);

      if (price <= 0) {
        showMessage('Alaabtani qiimo ma leh. Fadlan ku dar qiime.');
        cancelSalePrompt();
        nav.navigate('ProductForm', { product: latest || product, initialSale: true });
        return;
      }

      if (available < quantity) {
        showMessage('Kaydku kuma filna tiradaas.');
        return;
      }

      await quickSale({ product: { id: product.id, price }, qty: quantity });
      await load();
      const remaining = available - quantity;
      const label = latest?.name || product.name || 'Alaab';
      showMessage(`${label}: Kayd haray ${remaining}`);
      cancelSalePrompt();
    } catch (err) {
      showMessage('Iibku wuu fashilmay. Fadlan isku day mar kale.');
    } finally {
      scanningRef.current = false;
    }
  }, [cancelSalePrompt, load, nav, showMessage]);

  const handleScan = useCallback(async (raw) => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    const sku = normalizeSku(raw);
    setScannerVisible(false);
    try {
      const product = await getProductBySku(sku);
      if (!product) {
        showMessage('Alaab looma helin baar-koodhkan. Ku dar alaab cusub.');
        scanningRef.current = false;
        nav.navigate('ProductForm', { initialSku: sku, initialSale: true });
        return;
      }

      const price = Number(product.price || 0);
      const stock = Number(product.stock || 0);
      if (price <= 0) {
        showMessage('Alaabtani qiimo malahan. Fadlan ku dar qiime.');
        scanningRef.current = false;
        nav.navigate('ProductForm', { product, initialSale: true });
        return;
      }

      if (stock <= 0) {
        showMessage('Kaydku waa eber. Fadlan cusbooneysii kaydka.');
        scanningRef.current = false;
        nav.navigate('ProductForm', { product, initialSale: true });
        return;
      }

      setSaleProduct(product);
      setSaleQty('1');
      scanningRef.current = false;
      setScannerVisible(false);
    } catch (e) {
      showMessage('Akhrinta baar-koodhka way fashilantay.');
      scanningRef.current = false;
    }
  }, [format, load, nav, showMessage]);

  const quickActions = [
    {
      label: 'Kudar Iib',
      icon: 'arrow-up-bold-circle',
      onPress: () => nav.navigate('SaleForm'),
      gradient: Colors.gradientButton,
    },
    {
      label: 'Kudar Kharash',
      icon: 'arrow-down-bold-circle',
      onPress: () => nav.navigate('ExpenseForm'),
      gradient: ['rgba(104,117,245,0.7)', 'rgba(14,27,61,0.95)'],
    },
    {
      label: 'Baaro & Iibso',
      icon: 'barcode-scan',
      onPress: () => setScannerVisible(true),
      gradient: ['rgba(1,204,255,0.65)', 'rgba(14,36,64,0.95)'],
    },
  ];

  const renderTransactionItem = useCallback(({ item }) => {
    const isSale = item.type === 'sale';
    const iconColor = isSale ? Colors.success : Colors.danger;
    const iconBackground = isSale ? 'rgba(32,224,112,0.18)' : 'rgba(255,92,112,0.18)';
    const title = (item.product_name || item.label || item.name || '').trim() || (isSale ? 'Iib' : 'Kharash');
    const amount = Number(item.amount || 0);
    const amountDisplay = `${isSale ? '+' : '-'}${format(Math.abs(amount))}`;
    const created = new Date(item.created_at);
    const timestamp = `${created.toLocaleDateString()} • ${created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const chips = [];
    const qty = Number(item.qty || 0);
    if (isSale && qty > 0) chips.push(`${qty} unug`);
    if (item.currency) chips.push(item.currency.toUpperCase());

    return (
      <View style={styles.txItemWrapper}>
        <BrandCard border>
          <View style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: iconBackground }]}>
              <Text style={[styles.txIconText, { color: iconColor }]}>{isSale ? '↑' : '↓'}</Text>
            </View>
            <View style={styles.txContent}>
              <View style={styles.txHeaderRow}>
                <Text style={styles.txTitle} numberOfLines={1}>{title}</Text>
                <View style={[styles.txBadge, isSale ? styles.txBadgeSale : styles.txBadgeExpense]}>
                  <Text style={[styles.txBadgeText, isSale ? styles.txBadgeSaleText : styles.txBadgeExpenseText]}>
                    {isSale ? 'Iib' : 'Kharash'}
                  </Text>
                </View>
              </View>
              <Text style={styles.txTimestamp}>{timestamp}</Text>
              {!!chips.length && (
                <View style={styles.txChipRow}>
                  {chips.map((chip, index) => (
                    <View key={`${chip}-${index}`} style={styles.txChip}>
                      <Text style={styles.txChipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <Text style={[styles.txAmount, isSale ? styles.txAmountSale : styles.txAmountExpense]}>{amountDisplay}</Text>
          </View>
        </BrandCard>
      </View>
    );
  }, [format]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        ListHeaderComponent={
          <Animated.View style={{ opacity: fade }}>
            <LinearGradient
              colors={[Colors.background, Colors.backgroundAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroTopRow}>
                <View>
                  <Text variant="bodyLarge" style={styles.heroGreeting}>Salaan</Text>
                  <Text variant="headlineSmall" style={[styles.heroTitle, { color: theme.colors.onBackground }]}>
                    {profile?.companyName || profile?.name || 'Ganacsigaaga'}
                  </Text>
                  <Text style={styles.heroDate}>{new Date().toLocaleDateString()}</Text>
                </View>
                <IconButton
                  icon="bell-outline"
                  size={28}
                  iconColor={Colors.primary}
                  containerColor="rgba(1,204,255,0.12)"
                  style={styles.heroBell}
                  onPress={() => nav.navigate('Notifications')}
                />
              </View>

              <LinearGradient
                colors={["rgba(1,204,255,0.22)", 'rgba(14,26,52,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
              >
                <Text style={styles.balanceLabel}>Haraaga guud</Text>
                <Text style={styles.balanceValue}>{format(balance)}</Text>
                <View style={styles.balancePillsRow}>
                  <View style={[styles.balancePill, styles.balancePillIncome]}>
                    <Text style={[styles.balancePillIcon, { color: Colors.success }]}>↗</Text>
                    <View>
                      <Text style={styles.balancePillLabel}>Dakhli</Text>
                      <Text style={styles.balancePillValue}>{format(income)}</Text>
                    </View>
                  </View>
                  <View style={[styles.balancePill, styles.balancePillExpense]}>
                    <Text style={[styles.balancePillIcon, { color: Colors.danger }]}>↘</Text>
                    <View>
                      <Text style={styles.balancePillLabel}>Kharash</Text>
                      <Text style={styles.balancePillValue}>{format(expense)}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.quickActionsRow}>
                {quickActions.map((action) => (
                  <TouchableRipple key={action.label} onPress={action.onPress} borderless={false} style={styles.quickActionTouch} rippleColor="rgba(1,204,255,0.2)">
                    <LinearGradient
                      colors={action.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.quickActionCard}
                    >
                      <View style={styles.quickActionContent}>
                        <Text style={styles.quickActionIcon}>{action.icon === 'arrow-up-bold-circle' ? '↑' : action.icon === 'arrow-down-bold-circle' ? '↓' : '⌁'}</Text>
                        <Text style={styles.quickActionLabel}>{action.label}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableRipple>
                ))}
              </View>

              <Text variant="titleMedium" style={styles.sectionTitle}>
                Dhammaan Xisaabadka
              </Text>
            </LinearGradient>

            <View style={styles.statsRowWrapper}>
              <View style={styles.statsRow}>
                <CardStat title="Iib bishan" value={format(income)} icon="trending-up" filled color="rgba(1,204,255,0.6)" />
                <CardStat title="Kharash bishan" value={format(expense)} icon="trending-down" filled color="rgba(255,92,112,0.65)" />
              </View>
            </View>
          </Animated.View>
        }
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
      />

      <Animated.View style={{ position: 'absolute', right: spacing(3), bottom: spacing(3), transform: [{ scale: pulse }] }}>
        <FAB
          icon="barcode-scan"
          color="#fff"
          style={{ backgroundColor: Colors.success, borderRadius: 24, elevation: 8 }}
          onPress={() => setScannerVisible(true)}
          accessibilityLabel="Fur baaraha iib degdeg ah"
        />
      </Animated.View>

      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => {
          setScannerVisible(false);
          scanningRef.current = false;
        }}
        onScanned={handleScan}
      />

      <Portal>
        <Dialog visible={!!saleProduct} onDismiss={cancelSalePrompt}>
          <Dialog.Title>Iib degdeg ah</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: spacing(0.5) }}>{saleProduct?.name || 'Alaab'}</Text>
            <Text style={{ marginBottom: spacing(0.5), color: 'rgba(255,255,255,0.7)' }}>Kayd: {Number(saleProduct?.stock ?? 0)}</Text>
            <Text style={{ marginBottom: spacing(0.5), color: 'rgba(255,255,255,0.7)' }}>Qiimaha (hal shay): {format(Number(saleProduct?.price || 0))}</Text>
            <TextInput
              label="Tirada la iibinayo"
              value={saleQty}
              onChangeText={setSaleQty}
              keyboardType="numeric"
              mode="outlined"
              style={{ marginBottom: spacing() }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Wadarta: {saleTotal}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelSalePrompt}>Jooji</Button>
            <Button onPress={() => saleProduct && proceedSale(saleProduct, saleQty)} mode="contained">
              Iibso
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={dismissMessage}
        duration={3500}
        action={{ label: 'OK', onPress: dismissMessage }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing(3),
    paddingBottom: spacing(3.5),
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  heroGreeting: {
    color: Colors.mutedDark,
  },
  heroTitle: {
    fontFamily: 'Poppins_700Bold',
  },
  heroDate: {
    color: Colors.mutedSurface,
  },
  heroBell: {
    borderWidth: 1,
    borderColor: 'rgba(1,204,255,0.35)',
    borderRadius: 18,
  },
  balanceCard: {
    padding: spacing(2.5),
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(1,204,255,0.25)',
    marginBottom: spacing(2),
  },
  balanceLabel: {
    color: Colors.mutedDark,
    marginBottom: spacing(0.5),
  },
  balanceValue: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  balancePillsRow: {
    flexDirection: 'row',
    marginTop: spacing(1.5),
    gap: spacing(1.5),
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  balancePillIncome: {
    backgroundColor: 'rgba(32, 224, 112, 0.16)',
  },
  balancePillExpense: {
    backgroundColor: 'rgba(255, 92, 112, 0.14)',
  },
  balancePillIcon: {
    fontFamily: 'Poppins_600SemiBold',
    marginRight: 6,
  },
  balancePillLabel: {
    color: Colors.mutedSurface,
    fontSize: 12,
  },
  balancePillValue: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing(),
    marginBottom: spacing(2),
  },
  quickActionTouch: {
    flex: 1,
    borderRadius: 22,
  },
  quickActionCard: {
    paddingVertical: spacing(1.8),
    paddingHorizontal: spacing(1.5),
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(0.75),
  },
  quickActionIcon: {
    color: '#fff',
    fontSize: 18,
  },
  quickActionLabel: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionTitle: {
    marginTop: spacing(1),
    color: Colors.mutedDark,
  },
  statsRowWrapper: {
    paddingHorizontal: spacing(3),
    paddingTop: spacing(2),
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing(),
    marginBottom: spacing(1.5),
  },
  txItemWrapper: {
    paddingHorizontal: spacing(3),
    marginTop: spacing(),
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(1.5),
  },
  txIconText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
  },
  txContent: {
    flex: 1,
  },
  txHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(0.5),
  },
  txTitle: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    flex: 1,
    marginRight: spacing(),
  },
  txBadge: {
    borderRadius: 999,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.25),
    borderWidth: 1,
  },
  txBadgeSale: {
    backgroundColor: 'rgba(32,224,112,0.12)',
    borderColor: 'rgba(32,224,112,0.35)',
  },
  txBadgeExpense: {
    backgroundColor: 'rgba(255,92,112,0.12)',
    borderColor: 'rgba(255,92,112,0.35)',
  },
  txBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  txBadgeSaleText: {
    color: Colors.success,
  },
  txBadgeExpenseText: {
    color: Colors.danger,
  },
  txTimestamp: {
    color: Colors.mutedSurface,
    fontSize: 12,
  },
  txChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(0.75),
    marginTop: spacing(0.5),
  },
  txChip: {
    borderRadius: 999,
    paddingHorizontal: spacing(0.75),
    paddingVertical: spacing(0.25),
    backgroundColor: 'rgba(1,204,255,0.12)',
  },
  txChipText: {
    color: Colors.mutedDark,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  txAmount: {
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: spacing(1),
  },
  txAmountSale: {
    color: Colors.success,
  },
  txAmountExpense: {
    color: Colors.danger,
  },
});
