import { db, auth } from '../lib/firebase';
import { executeSql } from '../services/offline/db';
import { enqueue } from '../services/sync/syncService';

const normalizeSku = (v) => String(v || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

const createProductId = () => db.collection('products').doc().id;
const ownerId = () => auth?.currentUser?.uid || null;

export async function listProducts() {
  const res = await executeSql('SELECT * FROM products ORDER BY updated_at DESC');
  const rows = [];
  for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
  return rows;
}

export async function getProductBySku(sku) {
  // Prefer the most recently updated row in case duplicates exist; match SKU case-insensitively
  const res = await executeSql('SELECT * FROM products WHERE UPPER(TRIM(sku)) = UPPER(TRIM(?)) ORDER BY updated_at DESC LIMIT 1', [normalizeSku(sku)]);
  return res.rows.length ? res.rows.item(0) : null;
}

export async function getProductById(id) {
  const res = await executeSql('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
  return res.rows.length ? res.rows.item(0) : null;
}

export async function upsertProduct({ id, name, sku, price = 0, stock = 0 }) {
  const now = Date.now();
  let pid = id || null;
  const cleanSku = normalizeSku(sku);

  // If no id provided, reuse existing id by SKU to avoid duplicates
  if (!pid && cleanSku) {
    const existing = await getProductBySku(cleanSku);
    if (existing) pid = existing.id;
  }
  if (!pid) pid = createProductId();

  // Write the record
  await executeSql(
    'INSERT OR REPLACE INTO products (id, name, sku, price, stock, updated_at) VALUES (?,?,?,?,?,?)',
    [pid, name, cleanSku, price, stock, now]
  );

  // Ensure SKU uniqueness locally: remove any stale rows with same SKU but different id
  if (cleanSku) {
    await executeSql('DELETE FROM products WHERE UPPER(TRIM(sku)) = UPPER(TRIM(?)) AND id <> ?', [cleanSku, pid]);
  }

  await enqueue('products', { id: pid, name, sku: cleanSku, price, stock, updated_at: now, ownerId: ownerId() });
  return pid;
}

export async function adjustStock(id, delta) {
  const prod = await getProductById(id);
  const newStock = (prod?.stock || 0) + delta;
  await executeSql('UPDATE products SET stock = ?, updated_at = ? WHERE id = ?', [newStock, Date.now(), id]);
  const updatedAt = Date.now();
  await enqueue('products', { id, stock: newStock, updated_at: updatedAt, ownerId: ownerId() });
  return newStock;
}

export async function ensureBySku(sku) {
  let p = await getProductBySku(sku);
  if (!p) {
    const id = await upsertProduct({ name: 'Alaab cusub', sku, price: 0, stock: 0 });
    p = await getProductById(id);
  }
  return p;
}
