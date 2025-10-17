import { db } from '../lib/firebase';
import { executeSql } from '../services/offline/db';
import { enqueue } from '../services/sync/syncService';

const createCustomerId = () => db.collection('customers').doc().id;

export async function listCustomers(search = '') {
  const res = await executeSql('SELECT * FROM customers WHERE name LIKE ? ORDER BY name ASC', [`%${search}%`]);
  const rows = [];
  for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
  return rows;
}

export async function upsertCustomer({ id, name, phone = '', email = '' }) {
  const now = Date.now();
  const cid = id || createCustomerId();
  await executeSql(
    'INSERT OR REPLACE INTO customers (id, name, phone, email, balance, updated_at) VALUES (?,?,?,?,COALESCE((SELECT balance FROM customers WHERE id=?),0),?)',
    [cid, name, phone, email, cid, now]
  );
  await enqueue('customers', { id: cid, name, phone, email, updated_at: now });
  return cid;
}

export async function adjustCustomerBalance(id, delta) {
  const res = await executeSql('SELECT balance FROM customers WHERE id=?', [id]);
  const bal = res.rows.length ? res.rows.item(0).balance : 0;
  const newBal = bal + delta;
  await executeSql('UPDATE customers SET balance = ?, updated_at = ? WHERE id = ?', [newBal, Date.now(), id]);
  await enqueue('customers', { id, balance: newBal, updated_at: Date.now() });
  return newBal;
}

export async function getCustomer(id) {
  const res = await executeSql('SELECT * FROM customers WHERE id = ? LIMIT 1', [id]);
  return res.rows.length ? res.rows.item(0) : null;
}
