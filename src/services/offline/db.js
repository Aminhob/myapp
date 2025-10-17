import * as SQLite from 'expo-sqlite';

let database;
let currentOwner = null; // Firebase UID or null for default

const wrapTransactionCallback = (originalTx, onFinish = () => {}) => {
  if (!originalTx || typeof originalTx !== 'object') return originalTx;
  if (typeof originalTx.executeSql === 'function') return originalTx;
  if (typeof originalTx.executeSqlAsync === 'function') {
    const txWrapper = Object.create(originalTx);
    txWrapper.executeSql = (sql, params = [], onSuccess = () => {}, onError = () => false) => {
      return originalTx.executeSqlAsync(sql, params)
        .then((result) => {
          onSuccess(txWrapper, result);
          return result;
        })
        .catch((error) => {
          const handled = onError(txWrapper, error);
          if (handled === false) {
            return false;
          }
          throw error;
        })
        .finally(onFinish);
    };
    return txWrapper;
  }
  return originalTx;
};

const normalizeDatabase = (db) => {
  if (!db) return db;
  if (typeof db.transaction === 'function') return db;
  if (typeof db.transactionSync === 'function') {
    const wrapper = Object.create(db);
    wrapper.transaction = (callback = () => {}) => {
      try {
        db.transactionSync((tx) => callback(wrapTransactionCallback(tx)));
      } catch (error) {
        console.warn('SQLite transactionSync failed', error);
      }
    };
    return wrapper;
  }
  if (typeof db.transactionAsync === 'function') {
    const wrapper = Object.create(db);
    wrapper.transaction = (callback = () => {}) => {
      db.transactionAsync(async (tx) => {
        const wrappedTx = wrapTransactionCallback(tx);
        await callback(wrappedTx);
      }).catch((error) => {
        console.warn('SQLite transactionAsync failed', error);
      });
    };
    return wrapper;
  }
  return db;
};

const ensureDatabase = (ownerId) => {
  const name = ownerId ? `emaamul_${ownerId}.db` : 'emaamul.db';
  if (SQLite.openDatabaseSync) {
    return normalizeDatabase(SQLite.openDatabaseSync(name));
  }
  if (SQLite.openDatabase) {
    return normalizeDatabase(SQLite.openDatabase(name));
  }
  return {
    _warned: false,
    transaction(callback = () => {}) {
      if (!this._warned) {
        console.warn('SQLite is unavailable in Expo Go; offline features are disabled until you use a development build.');
        this._warned = true;
      }
      const tx = {
        executeSql(sql, params = [], onSuccess = () => {}, onError = () => false) {
          const error = new Error('SQLite is unavailable in Expo Go; use a development build.');
          return onError(error);
        },
      };
      callback(tx);
    },
    closeAsync: async () => {},
    deleteAsync: async () => {},
  };
};

export const setDbOwner = (ownerId) => {
  // Open a DB file per user to isolate data per account
  currentOwner = ownerId || null;
  database = ensureDatabase(currentOwner);
  return database;
};

export const getDb = () => {
  if (!database) {
    database = ensureDatabase(currentOwner);
  }
  return database;
};

export const executeSql = (sql, params = []) => new Promise((resolve, reject) => {
  const dbInstance = getDb();
  if (!dbInstance || typeof dbInstance.transaction !== 'function') {
    const error = new Error('SQLite transaction API unavailable; offline storage disabled in this environment.');
    reject(error);
    return;
  }
  dbInstance.transaction(tx => {
    if (typeof tx.executeSql !== 'function') {
      const err = new Error('SQLite executeSql unavailable; offline storage disabled in this environment.');
      reject(err);
      return;
    }
    tx.executeSql(sql, params, (_, res) => resolve(res), (_, err) => { reject(err); return false; });
  });
});

export const setupDb = () => {
  const dbInstance = getDb();
  if (!dbInstance || typeof dbInstance.transaction !== 'function') {
    console.warn('Skipping SQLite setup; database API unavailable in this environment.');
    return;
  }
  const queries = [
    `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY NOT NULL, name TEXT, sku TEXT, price REAL, stock INTEGER DEFAULT 0, updated_at INTEGER)`,
    `CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY NOT NULL, name TEXT, phone TEXT, email TEXT, balance REAL DEFAULT 0, updated_at INTEGER)`,
    `CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY NOT NULL, type TEXT, customer_id TEXT, product_id TEXT, qty REAL, amount REAL, currency TEXT, label TEXT, created_at INTEGER, synced INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS debts (id TEXT PRIMARY KEY NOT NULL, customer_id TEXT, amount REAL, due_date INTEGER, status TEXT, notes TEXT, updated_at INTEGER)`,
    `CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY NOT NULL, customer_id TEXT, total REAL, status TEXT, created_at INTEGER, due_date INTEGER)`,
    `CREATE TABLE IF NOT EXISTS invoice_items (id TEXT PRIMARY KEY NOT NULL, invoice_id TEXT, name TEXT, price REAL, qty REAL)`,
    `CREATE TABLE IF NOT EXISTS sync_queue (id INTEGER PRIMARY KEY AUTOINCREMENT, col TEXT, payload TEXT, created_at INTEGER)`
  ];
  dbInstance.transaction(tx => {
    queries.forEach(q => tx.executeSql(q));
    // migrations (best-effort)
    tx.executeSql('ALTER TABLE invoices ADD COLUMN due_date INTEGER', [], () => {}, () => false);
    // Distinguish debt direction: 'owed' (to you) vs 'borrowed' (you owe)
    tx.executeSql('ALTER TABLE debts ADD COLUMN type TEXT', [], () => {}, () => false);
    tx.executeSql('ALTER TABLE transactions ADD COLUMN label TEXT', [], () => {}, () => false);
  });
};
