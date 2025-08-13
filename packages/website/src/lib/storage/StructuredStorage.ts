/**
 * Simple structured data storage layer
 * Uses IndexedDB as primary storage with memory fallback
 */

interface StorageItem<T = any> {
  id: string;
  data: T;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export class StructuredStorage {
  private dbName: string;
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private memoryStorage = new Map<string, StorageItem>();
  private useMemoryFallback = false;
  private isInitialized = false;

  constructor(dbName: string = 'default_storage') {
    this.dbName = dbName;
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, using memory storage');
        this.useMemoryFallback = true;
        this.isInitialized = true;
        return;
      }

      this.db = await this.openDatabase();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize IndexedDB, falling back to memory storage:', error);
      this.useMemoryFallback = true;
      this.isInitialized = true;
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for all data types
        if (!db.objectStoreNames.contains('data')) {
          const store = db.createObjectStore('data', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  async save<T>(type: string, data: T, id?: string): Promise<string> {
    await this.ensureInitialized();

    const itemId = id || this.generateId();
    const item: StorageItem<T> = {
      id: itemId,
      data,
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (this.useMemoryFallback) {
      this.memoryStorage.set(itemId, item);
      return itemId;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.put(item);

      request.onsuccess = () => resolve(itemId);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(id: string): Promise<T | null> {
    await this.ensureInitialized();

    if (this.useMemoryFallback) {
      const item = this.memoryStorage.get(id);
      return item ? item.data : null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result;
        resolve(item ? item.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getByType<T>(type: string): Promise<T[]> {
    await this.ensureInitialized();

    if (this.useMemoryFallback) {
      const items = Array.from(this.memoryStorage.values())
        .filter(item => item.type === type)
        .map(item => item.data);
      return items;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const items = request.result.map(item => item.data);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureInitialized();

    if (this.useMemoryFallback) {
      return this.memoryStorage.delete(id);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteByType(type: string): Promise<number> {
    await this.ensureInitialized();

    if (this.useMemoryFallback) {
      let deleted = 0;
      for (const [id, item] of this.memoryStorage.entries()) {
        if (item.type === type) {
          this.memoryStorage.delete(id);
          deleted++;
        }
      }
      return deleted;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const index = store.index('type');
      const request = index.getAllKeys(type);

      request.onsuccess = () => {
        const keys = request.result;
        let deleted = 0;

        keys.forEach(key => {
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => deleted++;
        });

        resolve(deleted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();

    if (this.useMemoryFallback) {
      this.memoryStorage.clear();
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  getStorageType(): 'indexeddb' | 'memory' {
    return this.useMemoryFallback ? 'memory' : 'indexeddb';
  }
}

// Factory function to create storage instances with custom database names
export const createStorage = (dbName: string) => new StructuredStorage(dbName);

// Default storage instance for backward compatibility
export const structuredStorage = new StructuredStorage('sunrain_storage');
