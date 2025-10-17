import { db, auth } from '../lib/firebase';
import { executeSql } from '../services/offline/db';
import { enqueue } from '../services/sync/syncService';
import { adjustStock } from './productRepo';
import { adjustCustomerBalance } from './customerRepo';

const createTransactionId = () => db.collection('transactions').doc().id;
const ownerId = () => auth?.currentUser?.uid || null;

export async function listRecentTransactions(limit = 50) {
  const query = `
    SELECT t.*, p.name AS product_name
    FROM transactions t
    LEFT JOIN products p ON p.id = t.product_id
    ORDER BY t.created_at DESC
    LIMIT ?
  `;
  const res = await executeSql(query, [limit]);
  const rows = [];
  for (let i = 0; i < res.rows.length; i++) {
    const item = res.rows.item(i);
    const enriched = {
      ...item,
      name: item.product_name || item.label || item.name || null,
      label: item.label || null,
    };
    rows.push(enriched);
  }
  return rows;
}

export async function getTransactionById(id) {
  const res = await executeSql('SELECT * FROM transactions WHERE id = ? LIMIT 1', [id]);
  const tx = res.rows.length ? res.rows.item(0) : null;
  if (!tx) return null;
  let product = null;
  let customer = null;
  try {
    if (tx.product_id) {
      const prodRes = await executeSql('SELECT * FROM products WHERE id = ? LIMIT 1', [tx.product_id]);
      product = prodRes.rows.length ? prodRes.rows.item(0) : null;
    }
    if (tx.customer_id) {
      const custRes = await executeSql('SELECT * FROM customers WHERE id = ? LIMIT 1', [tx.customer_id]);
      customer = custRes.rows.length ? custRes.rows.item(0) : null;
    }
  } catch {}
  return { ...tx, product, customer };
}

export async function updateTransaction({ id, amount, qty, currency }) {
  const tx = await getTransactionById(id);
  if (!tx) throw new Error('Transaction not found');
  const updates = { amount: Number(amount), qty: Number(qty), currency };
  await executeSql('UPDATE transactions SET amount = ?, qty = ?, currency = ? WHERE id = ?', [updates.amount, updates.qty, currency, id]);
  if (tx.type === 'sale' && tx.product_id) {
    const prevQty = Number(tx.qty || 0);
    const nextQty = Number(qty);
    const delta = nextQty - prevQty;
    if (delta !== 0) {
      await adjustStock(tx.product_id, -delta);
    }
  }
  const updatedAt = Date.now();
  await enqueue('transactions', { id, type: tx.type, ...updates, updated_at: updatedAt, ownerId: ownerId() });
  return { ...tx, ...updates };
}

export async function addSale({ productId, qty = 1, price = 0, currency = '', customerId = null, paid = true }) {
  const id = createTransactionId();
  const created = Date.now();
  const amount = price * qty;
  await executeSql(
    `INSERT INTO transactions (id, type, customer_id, product_id, qty, amount, currency, label, created_at, synced) VALUES (?,?,?,?,?,?,?,?,?,0)`,
    [id, 'sale', customerId, productId, qty, amount, currency, null, created]
  );
  await enqueue('transactions', { id, type: 'sale', customer_id: customerId, product_id: productId, qty, amount, currency, created_at: created, ownerId: ownerId() });

  if (productId) await adjustStock(productId, -qty);
  if (!paid && customerId) await adjustCustomerBalance(customerId, amount);
  return id;
}

export async function addExpense({ amount, currency = 'ETB', label = 'Kharash' }) {
  const id = createTransactionId();
  const created = Date.now();
  await executeSql(
    `INSERT INTO transactions (id, type, customer_id, product_id, qty, amount, currency, label, created_at, synced) VALUES (?,?,?,?,?,?,?,?,?,0)`,
    [id, 'expense', null, null, 1, amount, currency, label, created]
  );
  await enqueue('transactions', { id, type: 'expense', amount, currency, label, created_at: created, ownerId: ownerId() });
  return id;
}

export async function quickSale({ product, qty = 1 }) {
  const price = product.price || 0;
  return addSale({ productId: product.id, qty, price, currency: '', customerId: null, paid: true });
}
