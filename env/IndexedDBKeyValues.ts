class IndexedDBKeyValues {
    constructor(public dbName: string, public objName) {
      this.dbName = dbName;
      this.storeName = storeName;
      this.db = null;
    }
  
    async init() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
  
        request.onupgradeneeded = event => {
          this.db = event.target.result;
          this.db.createObjectStore(this.storeName, { keyPath: 'key' });
        };
  
        request.onsuccess = event => {
          this.db = event.target.result;
          resolve();
        };
  
        request.onerror = event => {
          reject(`Failed to open database: ${event.target.error}`);
        };
      });
    }
  
    async setItem(key, value) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ key, value });
  
        request.onsuccess = () => {
          resolve();
        };
  
        request.onerror = event => {
          reject(`Failed to set item: ${event.target.error}`);
        };
      });
    }
  
    async getItem(key) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
  
        request.onsuccess = event => {
          resolve(event.target.result ? event.target.result.value : null);
        };
  
        request.onerror = event => {
          reject(`Failed to get item: ${event.target.error}`);
        };
      });
    }
  }
  
  // Usage example
  (async () => {
    const db = new IndexedDBKeyValues('myDatabase', 'myStore');
    await db.init();
    await db.setItem('myKey', 'myValue');
    const value = await db.getItem('myKey');
    console.log('Stored value:', value);  // Output: Stored value: myValue
  })();
  