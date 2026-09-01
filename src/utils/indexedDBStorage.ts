/**
 * IndexedDB Storage Helper for Ecolife Lighting
 * 
 * LocalStorage 5MB limitasiyası böyük məhsul kataloqlarını (şəkillər, təsvirlər, texniki göstəricilər)
 * saxlaya bilmir və QuotaExceededError verir.
 * IndexedDB isə brauzerdə gigabaytlarla məlumatı təhlükəsiz və itkisiz saxlayır.
 */

const DB_NAME = 'ecolife_database';
const DB_VERSION = 1;
const STORE_NAME = 'keyval_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const idbStorage = {
  /**
   * Get an item from IndexedDB
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result !== undefined ? (request.result as T) : null);
        };

        request.onerror = () => {
          resolve(null);
        };
      });
    } catch (err) {
      console.warn(`[IndexedDB] Error reading key "${key}":`, err);
      // Fallback to localStorage if IndexedDB fails
      try {
        const local = localStorage.getItem(key);
        return local ? JSON.parse(local) : null;
      } catch {
        return null;
      }
    }
  },

  /**
   * Set an item in IndexedDB and sync to localStorage if within size limits
   */
  async setItem<T = any>(key: string, value: T): Promise<boolean> {
    // 1. Write to IndexedDB (unlimited quota, rock solid)
    let idbSuccess = false;
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      idbSuccess = true;
    } catch (err) {
      console.warn(`[IndexedDB] Error writing key "${key}":`, err);
    }

    // 2. Also try writing to localStorage as fallback (for instant synchronous read on page load)
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // LocalStorage quota exceeded (normal for huge datasets), safely ignore since IndexedDB has it
    }

    return idbSuccess;
  },

  /**
   * Remove an item from IndexedDB and localStorage
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] Error deleting key "${key}":`, err);
    }

    try {
      localStorage.removeItem(key);
    } catch {}

    return true;
  },

  /**
   * Clear entire storage
   */
  async clear(): Promise<boolean> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error clearing store:', err);
    }

    return true;
  }
};
