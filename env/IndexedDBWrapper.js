export class IndexedDBWrapper {
    dbName;
    version;
    #db;
    constructor(dbName, version) {
        this.dbName = dbName;
        this.version = version;
        this.#db = null;
    }
    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (event) => {
                this.#db = event.target.result;
                if (!this.#db.objectStoreNames.contains('store')) {
                    this.#db.createObjectStore('store', { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (event) => {
                this.#db = event.target.result;
                resolve(this.#db);
            };
            request.onerror = (event) => {
                reject(`Database error: ${event.target.errorCode}`);
            };
        });
    }
    async #tableAction(storeName, methodName, arg1, arg2) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store[methodName](arg1, arg2);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }
    async addData(storeName, data, key) {
        return await this.#tableAction(storeName, 'add', data, key);
    }
    async getRow(storeName, idx) {
        try {
            return await this.#tableAction(storeName, 'get', idx + 1);
        }
        catch (e) {
            return undefined;
        }
    }
    async updateData(storeName, key, data) {
        const current = await this.getRow(storeName, key) || {};
        const { assignGingerly } = await import('../lib/assignGingerly.js');
        await assignGingerly(current, data);
        return await this.#tableAction(storeName, 'put', current);
    }
    async getLatest(storeName) {
        try {
            const count = await this.getCount(storeName);
            return await this.getRow(storeName, count - 1);
        }
        catch (e) {
            return undefined;
        }
    }
    async getCount(storeName) {
        return await this.#tableAction(storeName, 'count');
    }
}
