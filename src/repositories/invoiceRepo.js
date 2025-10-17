import { db, auth } from '../lib/firebase';
import { executeSql } from '../services/offline/db';
import { enqueue } from '../services/sync/syncService';

const createInvoiceId = () => db.collection('invoices').doc().id;
const createInvoiceItemId = () => db.collection('invoices').doc().collection('items').doc().id;
const ownerId = () => auth?.currentUser?.uid || null;

export async function createInvoice({ customerId = null, items = [], status = 'pending', dueDate = null }) {
  const id = createInvoiceId();
  const created = Date.now();
  const total = items.reduce((s, it) => s + (Number(it.price) * Number(it.qty)), 0);
  await executeSql('INSERT INTO invoices (id, customer_id, total, status, created_at, due_date) VALUES (?,?,?,?,?,?)', [id, customerId, total, status, created, dueDate ? Number(dueDate) : null]);
  for (const it of items) {
    const iid = createInvoiceItemId();
    await executeSql('INSERT INTO invoice_items (id, invoice_id, name, price, qty) VALUES (?,?,?,?,?)', [iid, id, it.name, Number(it.price), Number(it.qty)]);
  }
  await enqueue('invoices', { id, customer_id: customerId, total, status, created_at: created, due_date: dueDate ? Number(dueDate) : null, ownerId: ownerId() });
  return id;
}

export async function listInvoices() {
  const res = await executeSql('SELECT * FROM invoices ORDER BY created_at DESC');
  const rows = [];
  for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
  return rows;
}

export async function getInvoice(id) {
  const r = await executeSql('SELECT * FROM invoices WHERE id=? LIMIT 1', [id]);
  const inv = r.rows.length ? r.rows.item(0) : null;
  if (!inv) return null;
  const itemsRes = await executeSql('SELECT * FROM invoice_items WHERE invoice_id=?', [id]);
  const items = [];
  for (let i = 0; i < itemsRes.rows.length; i++) items.push(itemsRes.rows.item(i));
  return { ...inv, items };
}

export async function setInvoiceStatus(id, status) {
  await executeSql('UPDATE invoices SET status=? WHERE id=?', [status, id]);
  await enqueue('invoices', { id, status, updated_at: Date.now(), ownerId: ownerId() });
}

export async function createFromSale({ sale, customer, dueDate }) {
  const items = [{ name: sale.productName || 'Iib', price: Number(sale.price || sale.amount || 0), qty: Number(sale.qty || 1) }];
  const id = await createInvoice({ customerId: customer?.id || null, items, status: 'unpaid', dueDate });
  return id;
}
