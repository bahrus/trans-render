export class IndexedDBWrapper extends EventTarget {
    dbName;
    version;
    #db;
    constructor(dbName, version) {
        super();
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
    async addData(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }
    async getData(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([storeName]);
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(`Get error: ${event.target.errorCode}`);
            };
        });
    }
    async getLatest(storeName) {
        const count = await this.getCount(storeName);
        return await this.getData(storeName, count);
    }
    async getCount(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([storeName]);
            const store = transaction.objectStore(storeName);
            const request = store.count();
            request.addEventListener('success', (e) => {
                console.log({ e });
            });
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(`Get error: ${event.target.errorCode}`);
            };
        });
    }
}
