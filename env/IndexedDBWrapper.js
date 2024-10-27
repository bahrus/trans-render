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
    async #storeInvoke(storeName, methodName, arg1, arg2) {
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
        return await this.#storeInvoke(storeName, 'add', data, key);
    }
    async getData(storeName, key) {
        try {
            return await this.#storeInvoke(storeName, 'get', key);
        }
        catch (e) {
            return undefined;
        }
    }
    async getLatest(storeName) {
        try {
            const count = await this.getCount(storeName);
            return await this.getData(storeName, count);
        }
        catch (e) {
            return undefined;
        }
    }
    async getCount(storeName) {
        return await this.#storeInvoke(storeName, 'count');
    }
}
