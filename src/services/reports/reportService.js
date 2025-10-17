import { executeSql } from '../offline/db';

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23,59,59,999); return x; }

export function getRange(range) {
  const now = new Date();
  if (range === 'day') {
    return { start: startOfDay(now), end: endOfDay(now) };
  } else if (range === 'week') {
    const day = now.getDay(); // 0 Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon));
    const end = endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
    return { start, end };
  } else {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
}

export async function getPnL(range = 'day') {
  const { start, end } = getRange(range);
  const res = await executeSql('SELECT type, amount FROM transactions WHERE created_at BETWEEN ? AND ?', [start.getTime(), end.getTime()]);
  let income = 0, expense = 0;
  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows.item(i);
    if (row.type === 'sale') income += Number(row.amount || 0);
    else if (row.type === 'expense') expense += Number(row.amount || 0);
  }
  return { income, expense, net: income - expense };
}
