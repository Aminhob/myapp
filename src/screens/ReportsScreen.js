import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { Button, Text, useTheme, Divider, Chip, Surface, ActivityIndicator } from 'react-native-paper';
import { spacing, Colors } from '../theme';
import { generateReportPdf, sharePdf } from '../services/pdf/pdfService';
import { exportToCsv } from '../services/export/csvService';
import { useNavigation } from '@react-navigation/native';
import { getPnL } from '../services/reports/reportService';
import { exportToXlsx } from '../services/export/xlsxService';
import BrandHeader from '../components/ui/BrandHeader';
import BrandCard from '../components/ui/BrandCard';
import { useCurrency } from '../context/CurrencyContext';
import { listRecentTransactions } from '../repositories/transactionRepo';
import { listInvoices } from '../repositories/invoiceRepo';
import { listProducts } from '../repositories/productRepo';
import ScreenWrapper from '../components/ui/ScreenWrapper';

const chartWidth = Math.min(Dimensions.get('window').width - spacing(4), 360);
const chartHeight = 180;

const makeBar = (value, max) => {
  const pct = max === 0 ? 0 : Math.max(6, Math.round((value / max) * 100));
  return { width: `${Math.min(pct, 100)}%`, value };
};

function SummaryTile({ title, value, trend, tone = 'default' }) {
  const theme = useTheme();
  const colorMap = {
    success: Colors.success,
    danger: Colors.danger,
    warning: '#FFC107',
    default: theme.colors.onSurface,
  };
  const iconMap = {
    success: 'trending-up',
    danger: 'trending-down',
    warning: 'information-variant',
    default: 'chart-line',
  };
  const tint = colorMap[tone] || theme.colors.primary;
  const icon = iconMap[tone];
  return (
    <Surface style={{ flex: 1, marginRight: spacing(1), borderRadius: 20, padding: spacing(2), backgroundColor: 'rgba(1,0,42,0.12)' }} elevation={3}>
      <Text style={{ fontFamily: 'Poppins_600SemiBold', color: tint, letterSpacing: 0.2 }}>{title}</Text>
      <Text variant="headlineSmall" style={{ marginTop: spacing(0.75), color: '#fff', fontFamily: 'Poppins_700Bold' }}>{value}</Text>
      {!!trend && <Text style={{ marginTop: spacing(0.75), color: tint, fontFamily: 'Poppins_500Medium' }}>{trend}</Text>}
      {!!icon && <Text style={{ marginTop: spacing(0.75), color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Poppins_400Regular' }}>{`Icon: ${icon}`}</Text>}
    </Surface>
  );
}

function BarRow({ label, value, max, color }) {
  const bar = makeBar(value, max);
  return (
    <View style={{ marginBottom: spacing() }}>
      <Text style={{ color: 'rgba(255,255,255,0.7)', marginBottom: spacing(0.5) }}>{label}</Text>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', height: 16, borderRadius: 8, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: bar.width, backgroundColor: color, borderRadius: 8 }} />
      </View>
      <Text style={{ color: '#fff', marginTop: 4 }}>{value.toLocaleString()}</Text>
    </View>
  );
}

function TopList({ title, items, render }) {
  return (
    <BrandCard border={false} style={{ marginBottom: spacing(2), backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <Text variant="titleMedium" style={{ marginBottom: spacing() }}>{title}</Text>
      {items.length === 0 && <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Weli xog lama helin.</Text>}
      {items.slice(0, 5).map(render)}
    </BrandCard>
  );
}

export default function ReportsScreen() {
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();
  const [range, setRange] = useState('day');
  const [stats, setStats] = useState({ income: 0, expense: 0, net: 0 });
  const [trend, setTrend] = useState({ income: 0, expense: 0, net: 0 });
  const [topSales, setTopSales] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [insights, setInsights] = useState({
    avgDaily: 0,
    peakDay: null,
    peakValue: 0,
    latestValue: 0,
    changePct: 0,
    totalSales: 0,
    totalExpenses: 0,
    netMargin: 0,
  });
  const theme = useTheme();
  const { format } = useCurrency();

  const summaryCards = useMemo(() => ([
    {
      title: 'Dakhliga',
      value: format(stats.income),
      trend: `${trend.income >= 0 ? '+' : ''}${trend.income.toFixed(1)}% vs range hore`,
      tone: trend.income >= 0 ? 'success' : 'danger',
    },
    {
      title: 'Kharashka',
      value: format(stats.expense),
      trend: `${trend.expense >= 0 ? '+' : ''}${trend.expense.toFixed(1)}%`,
      tone: trend.expense >= 0 ? 'danger' : 'success',
    },
    {
      title: 'Hadhaaga',
      value: format(stats.net),
      trend: `${trend.net >= 0 ? '+' : ''}${trend.net.toFixed(1)}%`,
      tone: trend.net >= 0 ? 'success' : 'danger',
    },
  ]), [stats, trend, format]);

  const loadSecondary = async () => {
    try {
      const tx = await listRecentTransactions(100);
      const sales = tx.filter(t => t.type === 'sale');
      const expenses = tx.filter(t => t.type === 'expense');
      const saleAgg = {};
      sales.forEach(s => {
        const key = s.product_id || 'unknown';
        saleAgg[key] = (saleAgg[key] || 0) + Number(s.amount || 0);
      });
      const expAgg = {};
      expenses.forEach(e => {
        const key = e.name || 'Kharash';
        expAgg[key] = (expAgg[key] || 0) + Number(e.amount || 0);
      });
      const [products, invoices] = await Promise.all([
        listProducts(),
        listInvoices({ limit: 5 }),
      ]);
      const topSalesList = Object.entries(saleAgg)
        .map(([id, total]) => ({ id, total, name: products.find(p => p.id === id)?.name || 'Alaab', qty: sales.filter(s => s.product_id === id).reduce((acc, cur) => acc + Number(cur.qty || 0), 0) }))
        .sort((a, b) => b.total - a.total);
      const topExpenseList = Object.entries(expAgg)
        .map(([label, total]) => ({ label, total }))
        .sort((a, b) => b.total - a.total);
      setTopSales(topSalesList);
      setTopExpenses(topExpenseList);
      setRecentInvoices(invoices);

      const salesTotals = sales.reduce((sum, cur) => sum + Number(cur.amount || 0), 0);
      const expenseTotals = expenses.reduce((sum, cur) => sum + Number(cur.amount || 0), 0);

      const normalizeDate = (value) => {
        const raw = value ?? Date.now();
        const ts = typeof raw === 'number' ? raw : Date.parse(raw);
        if (Number.isNaN(ts)) return null;
        const d = new Date(ts);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      };

      const dayMap = new Map();
      sales.forEach((s) => {
        const day = normalizeDate(s.created_at || s.createdAt);
        if (!day) return;
        const key = day.toISOString();
        const current = dayMap.get(key) || { date: day, value: 0 };
        current.value += Number(s.amount || 0);
        dayMap.set(key, current);
      });

      const dayEntries = Array.from(dayMap.values()).sort((a, b) => a.date - b.date);
      const dayCount = dayEntries.length || 1;
      const avgDaily = dayEntries.reduce((sum, entry) => sum + entry.value, 0) / dayCount;
      const peakEntry = dayEntries.reduce((max, entry) => (entry.value > (max?.value ?? 0) ? entry : max), dayEntries[0] || null);
      const latest = dayEntries[dayEntries.length - 1] || null;
      const previous = dayEntries[dayEntries.length - 2] || null;
      const changePct = previous ? ((latest.value - previous.value) / (previous.value || 1)) * 100 : 0;
      const netMargin = salesTotals === 0 ? 0 : ((salesTotals - expenseTotals) / salesTotals) * 100;

      setInsights({
        avgDaily,
        peakDay: peakEntry?.date ?? null,
        peakValue: peakEntry?.value ?? 0,
        latestValue: latest?.value ?? 0,
        changePct,
        totalSales: salesTotals,
        totalExpenses: expenseTotals,
        netMargin,
      });
    } catch {}
  };

  const onGenerate = async (range) => {
    setBusy(true);
    try {
      const uri = await generateReportPdf({ title: `Warbixin (${range})`, items: [{ name: 'Iib', value: 3200 }, { name: 'Kharash', value: 1800 }] });
      await sharePdf(uri);
    } finally {
      setBusy(false);
    }
  };

  const onCsv = async () => {
    setBusy(true);
    try {
      const pnl = await getPnL(range === 'day' ? 'day' : range === 'week' ? 'week' : 'month');
      const rows = [
        { Qayb: 'Dakhliga', Qiime: pnl.income },
        { Qayb: 'Kharashka', Qiime: pnl.expense },
        { Qayb: 'hadhaaga', Qiime: pnl.net },
      ];
      await exportToCsv('warbixin.csv', rows);
    } finally { setBusy(false); }
  };

  const onXlsx = async () => {
    setBusy(true);
    try {
      const pnl = await getPnL(range === 'day' ? 'day' : range === 'week' ? 'week' : 'month');
      const rows = [
        { Qayb: 'Dakhliga', Qiime: pnl.income },
        { Qayb: 'Kharashka', Qiime: pnl.expense },
        { Qayb: 'Hadhka', Qiime: pnl.net },
      ];
      await exportToXlsx('warbixin.xlsx', rows);
    } finally { setBusy(false); }
  };

  const refresh = async (r) => {
    setRange(r);
    setLoading(true);
    try {
      const pnl = await getPnL(r);
      setStats(pnl);
      const prev = await getPnL(r === 'day' ? 'week' : r === 'week' ? 'month' : 'month');
      const delta = (current, previous) => {
        const base = previous === 0 ? 1 : previous;
        return ((current - previous) / base) * 100;
      };
      setTrend({
        income: delta(pnl.income, prev.income || 0),
        expense: delta(pnl.expense, prev.expense || 0),
        net: delta(pnl.net, prev.net || 0),
      });
      await loadSecondary();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh('week').catch(() => {});
  }, []);

  const incomeVsExpense = useMemo(() => {
    const max = Math.max(stats.income, stats.expense, Math.abs(stats.net));
    return {
      max,
      rows: [
        { label: 'Dakhli', value: stats.income, color: Colors.success },
        { label: 'Kharash', value: stats.expense, color: Colors.danger },
        { label: 'Hadhka', value: stats.net, color: stats.net >= 0 ? Colors.success : Colors.danger },
      ],
    };
  }, [stats]);

  return (
    <ScreenWrapper backgroundColor={theme.colors.background}>
      <BrandHeader title="Warbixinada">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingBottom: spacing(0.5), gap: spacing(0.75) }}
        >
          <Chip
            selected={range==='day'}
            onPress={() => refresh('day')}
            style={{ borderRadius: 16, minWidth: 92, justifyContent: 'center', backgroundColor: range==='day' ? 'rgba(254,50,0,0.22)' : 'rgba(255,255,255,0.06)' }}
            textStyle={{ fontFamily: 'Poppins_500Medium', color: '#fff' }}
          >
            Maalin
          </Chip>
          <Chip
            selected={range==='week'}
            onPress={() => refresh('week')}
            style={{ borderRadius: 16, minWidth: 92, justifyContent: 'center', backgroundColor: range==='week' ? 'rgba(254,50,0,0.22)' : 'rgba(255,255,255,0.06)' }}
            textStyle={{ fontFamily: 'Poppins_500Medium', color: '#fff' }}
          >
            Usbuuc
          </Chip>
          <Chip
            selected={range==='month'}
            onPress={() => refresh('month')}
            style={{ borderRadius: 16, minWidth: 92, justifyContent: 'center', backgroundColor: range==='month' ? 'rgba(254,50,0,0.22)' : 'rgba(255,255,255,0.06)' }}
            textStyle={{ fontFamily: 'Poppins_500Medium', color: '#fff' }}
          >
            Bil
          </Chip>
        </ScrollView>
      </BrandHeader>

      {loading && (
        <View style={{ padding: spacing(2.5), alignItems: 'center' }}>
          <ActivityIndicator animating color={theme.colors.primary} />
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(4) }}>
        <View style={{ flexDirection: 'row', marginBottom: spacing(2), gap: spacing(1) }}>
          {summaryCards.map((card, idx) => (
            <SummaryTile key={idx} {...card} />
          ))}
        </View>

        <BrandCard border={false} style={{ marginBottom: spacing(2), backgroundColor: 'rgba(1,0,42,0.12)', borderRadius: 24 }}>
          <Text variant="titleMedium" style={{ marginBottom: spacing() }}>P&L • {range === 'day' ? 'Maalinta' : range === 'week' ? 'Usbuuca' : 'Bisha'}</Text>
          {incomeVsExpense.rows.map((row) => (
            <BarRow key={row.label} label={row.label} value={row.value} max={incomeVsExpense.max} color={row.color} />
          ))}
          <Divider style={{ marginVertical: spacing() }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Dakhliga / Kharashka</Text>
            <Text style={{ color: '#fff' }}>{stats.expense === 0 ? '∞' : (stats.income / stats.expense).toFixed(2)}x</Text>
          </View>
        </BrandCard>

        <View style={{ flexDirection: 'row', marginBottom: spacing(2), gap: spacing(1) }}>
          <Button
            mode="contained"
            loading={busy}
            style={{ flex: 1, borderRadius: 18 }}
            contentStyle={{ paddingVertical: spacing(0.75) }}
            onPress={() => onGenerate(range)}
          >
            PDF
          </Button>
          <Button
            mode="outlined"
            loading={busy}
            style={{ flex: 1, borderRadius: 18 }}
            contentStyle={{ paddingVertical: spacing(0.75) }}
            onPress={onCsv}
          >
            CSV
          </Button>
          <Button
            mode="outlined"
            loading={busy}
            style={{ flex: 1, borderRadius: 18 }}
            contentStyle={{ paddingVertical: spacing(0.75) }}
            onPress={onXlsx}
          >
            Excel
          </Button>
        </View>
        <Button
          mode="outlined"
          onPress={() => nav.getParent()?.navigate('InvoiceList')}
          style={{ marginBottom: spacing(2), borderRadius: 18 }}
          contentStyle={{ paddingVertical: spacing(0.75) }}
        >
          Rasiidyo
        </Button>

        <BrandCard border={false} style={{ marginBottom: spacing(2), backgroundColor: 'rgba(1,0,42,0.12)', borderRadius: 24 }}>
          <Text variant="titleMedium" style={{ marginBottom: spacing() }}>Falanqeyn Dheeraad ah</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5) }}>
            <View style={{ flexGrow: 1, minWidth: '45%' }}>
              <Text style={{ color: Colors.mutedSurface, fontFamily: 'Poppins_500Medium' }}>Celcelis iib maalinle</Text>
              <Text style={{ color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 18, marginTop: spacing(0.5) }}>{format(insights.avgDaily || 0)}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: spacing(0.25), fontSize: 12 }}>Ku saleysan 30-kii isbeddel ee u dambeeyay.</Text>
            </View>
            <View style={{ flexGrow: 1, minWidth: '45%' }}>
              <Text style={{ color: Colors.mutedSurface, fontFamily: 'Poppins_500Medium' }}>Maalinta ugu sarreysa</Text>
              <Text style={{ color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 18, marginTop: spacing(0.5) }}>
                {insights.peakDay ? new Date(insights.peakDay).toLocaleDateString() : '—'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: spacing(0.25), fontSize: 12 }}>{format(insights.peakValue || 0)} iib</Text>
            </View>
            <View style={{ flexGrow: 1, minWidth: '45%' }}>
              <Text style={{ color: Colors.mutedSurface, fontFamily: 'Poppins_500Medium' }}>Isbeddelka iibka</Text>
              <Text style={{ color: insights.changePct >= 0 ? Colors.success : Colors.danger, fontFamily: 'Poppins_700Bold', fontSize: 18, marginTop: spacing(0.5) }}>
                {`${insights.changePct >= 0 ? '+' : ''}${insights.changePct.toFixed(1)}%`}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: spacing(0.25), fontSize: 12 }}>Isbarbardhigga maalinta ugu dambeysa iyo tii ka horreysay.</Text>
            </View>
            <View style={{ flexGrow: 1, minWidth: '45%' }}>
              <Text style={{ color: Colors.mutedSurface, fontFamily: 'Poppins_500Medium' }}>Saamiga faa'iidada</Text>
              <Text style={{ color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 18, marginTop: spacing(0.5) }}>
                {`${((insights.netMargin || 0)).toFixed(1)}%`}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: spacing(0.25), fontSize: 12 }}>Dakhliga iyo kharashyada ku saleysan xogta kama dambaysta ah.</Text>
            </View>
          </View>
        </BrandCard>

        <TopList
          title="Alaabta ugu iibka badan"
          items={topSales}
          render={(item, idx) => (
            <View key={item.id || idx} style={{ marginBottom: spacing(1.5) }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#fff' }}>{item.name}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{item.qty} x • {format(item.total)}</Text>
            </View>
          )}
        />

        <TopList
          title="Kharashyada ugu badan"
          items={topExpenses}
          render={(item, idx) => (
            <View key={idx} style={{ marginBottom: spacing(1.5) }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#fff' }}>{item.label}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{format(item.total)}</Text>
            </View>
          )}
        />

        <BrandCard border={false} style={{ marginBottom: spacing(2), backgroundColor: 'rgba(1,0,42,0.12)', borderRadius: 24 }}>
          <Text variant="titleMedium" style={{ marginBottom: spacing() }}>Rasiidyada ugu dambeyay</Text>
          {recentInvoices.length === 0 && <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Ma jiraan Rasiidyo dhowaan la helay.</Text>}
          {recentInvoices.map((inv) => (
            <View key={inv.id} style={{ marginBottom: spacing(), padding: spacing(), backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#fff' }}>#{inv.id.slice(0, 6)} • {format(inv.total || 0)}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Xaalad: {inv.status || 'aan la cayimin'}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Taariikh: {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '-'}</Text>
            </View>
          ))}
          <Button
            mode="text"
            onPress={() => nav.getParent()?.navigate('InvoiceList')}
            uppercase={false}
            style={{ alignSelf: 'flex-end' }}
            labelStyle={{ fontFamily: 'Poppins_500Medium', color: Colors.primary }}
          >
            Dhammaan Rasiidyada →
          </Button>
        </BrandCard>
      </ScrollView>
    </ScreenWrapper>
  );
}
