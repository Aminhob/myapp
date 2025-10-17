import { executeSql } from '../offline/db';

export async function salesSeries(days = 30) {
  const since = Date.now() - days * 86400000;
  const res = await executeSql('SELECT created_at, amount FROM transactions WHERE type = "sale" AND created_at >= ? ORDER BY created_at ASC', [since]);
  const byDay = new Map();
  for (let i = 0; i < res.rows.length; i++) {
    const r = res.rows.item(i);
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    byDay.set(key, (byDay.get(key) || 0) + Number(r.amount || 0));
  }
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    out.push({ date: d, value: byDay.get(key) || 0 });
  }
  return out;
}

export async function movingAverageForecast(window = 7) {
  const series = await salesSeries(30);
  if (series.length < window) return { forecast: 0, avg: 0, series };
  const lastWindow = series.slice(-window);
  const avg = lastWindow.reduce((s, p) => s + p.value, 0) / window;
  const forecast = avg; // next day equal to avg
  return { forecast, avg, series };
}

export function kobciyeTips({ avg }) {
  const tips = [];
  if (avg <= 0) tips.push('Korsii xayeysiinta si aad u kordhiso iibka.');
  if (avg > 0 && avg < 100) tips.push('Iibyo xasilloon: tixgeli qiimo-dhimis yar si loo dardargeliyo.');
  if (avg >= 100) tips.push('Iibka waa wanaagsan yahay, ka fiirso inaad kordhiso kaydka alaabta ugu iibka badan.');
  return tips;
}
