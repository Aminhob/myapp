import { db, auth } from '../lib/firebase';
import { executeSql } from '../services/offline/db';
import { enqueue } from '../services/sync/syncService';

const nowTs = () => Date.now();
const owner = () => auth?.currentUser?.uid || null;
const createDebtId = () => db.collection('debts').doc().id;

export async function listDebts(type = null) {
  // Backward compatible: treat NULL type as 'borrowed'.
  const where = type ? (type === 'borrowed' ? 'WHERE (d.type = ? OR d.type IS NULL)' : 'WHERE (d.type = ?)') : '';
  const params = type ? [type] : [];
  const res = await executeSql(`SELECT d.*, c.name AS customer_name
    FROM debts d LEFT JOIN customers c ON c.id = d.customer_id ${where}
    ORDER BY d.due_date ASC`, params);
  const rows = [];
  for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
  return rows;
}

export async function listDebtsGroupedByCustomer(type = null) {
  const rows = await listDebts(type);
  const groups = {};
  for (const r of rows) {
    const key = r.customer_id || 'unknown';
    if (!groups[key]) groups[key] = { customerId: key, customerName: r.customer_name || 'Macmiil aan la garan', items: [], total: 0 };
    groups[key].items.push(r);
    if ((r.status || 'pending') !== 'paid') groups[key].total += Number(r.amount || 0);
  }
  return Object.values(groups);
}

export async function getDebt(id) {
  const res = await executeSql('SELECT * FROM debts WHERE id = ? LIMIT 1', [id]);
  return res.rows.length ? res.rows.item(0) : null;
}

export async function upsertDebt({ id, customerId, amount, dueDate, status = 'pending', notes = '', type = 'borrowed' }) {
  const did = id || createDebtId();
  const updated = nowTs();
  await executeSql(
    `INSERT OR REPLACE INTO debts (id, customer_id, amount, due_date, status, notes, updated_at, type)
     VALUES (?,?,?,?,?,?,?,?)`,
    [did, customerId, Number(amount || 0), Number(dueDate || 0), status, notes, updated, type]
  );
  await enqueue('debts', { id: did, customerId, amount: Number(amount || 0), dueDate: Number(dueDate || 0), status, notes, type, updated_at: updated, ownerId: owner() });
  return did;
}

export async function deleteDebt(id) {
  await executeSql('DELETE FROM debts WHERE id = ?', [id]);
  await enqueue('debts', { id, _delete: true, ownerId: owner() });
}

export async function totals(type = null) {
  const where = type ? (type === 'borrowed' ? 'WHERE (type = ? OR type IS NULL)' : 'WHERE type = ?') : '';
  const res = await executeSql(`SELECT SUM(CASE WHEN status!='paid' THEN amount ELSE 0 END) AS outstanding,
    SUM(CASE WHEN status!='paid' AND due_date < ? THEN amount ELSE 0 END) AS overdue
    FROM debts ${where}`,
    type ? [nowTs(), type] : [nowTs()]
  );
  const row = res.rows.length ? res.rows.item(0) : { outstanding: 0, overdue: 0 };
  return { outstanding: Number(row.outstanding || 0), overdue: Number(row.overdue || 0) };
}
