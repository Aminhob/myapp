import * as Network from 'expo-network';
import { db, serverTimestamp } from '../../lib/firebase';
import { executeSql } from '../offline/db';

export async function enqueue(col, payload) {
  try {
    const createdAt = Date.now();
    await executeSql('INSERT INTO sync_queue (col, payload, created_at) VALUES (?,?,?)', [col, JSON.stringify(payload), createdAt]);
  } catch (e) {
    // ignore enqueue errors
  }
}

export async function syncQueue() {
  const net = await Network.getNetworkStateAsync();
  if (!net.isConnected || !net.isInternetReachable) return false;

  const res = await executeSql('SELECT * FROM sync_queue ORDER BY id ASC');
  const toDelete = [];
  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows.item(i);
    const payload = JSON.parse(row.payload || '{}');
    try {
      if (payload?.id) {
        await db.collection(row.col).doc(payload.id).set({ ...payload, syncedAt: serverTimestamp() }, { merge: true });
      } else {
        await db.collection(row.col).add({ ...payload, createdAt: serverTimestamp() });
      }
      toDelete.push(row.id);
    } catch (e) {
      // stop on first error to retry later
      break;
    }
  }
  if (toDelete.length) {
    const placeholders = toDelete.map(() => '?').join(',');
    await executeSql(`DELETE FROM sync_queue WHERE id IN (${placeholders})`, toDelete);
  }
  return true;
}

export async function syncNow(snapshot = {}) {
  try {
    await db.collection('sync_heartbeats').add({ ts: serverTimestamp(), payload: snapshot });
  } catch (e) {}
  await syncQueue();
}
