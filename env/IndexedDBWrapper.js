export class IndexedDBWrapper {
    dbName;
    tableName;
    version;
    #db;
    constructor(dbName, tableName, version) {
        this.dbName = dbName;
        this.tableName = tableName;
        this.version = version;
        this.#db = null;
    }
    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (event) => {
                this.#db = event.target.result;
                if (!this.#db.objectStoreNames.contains(this.tableName)) {
                    this.#db.createObjectStore(this.tableName, { keyPath: 'id', autoIncrement: true });
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
    async #tableAction(methodName, arg1, arg2) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.tableName], 'readwrite');
            const store = transaction.objectStore(this.tableName);
            const request = store[methodName](arg1, arg2);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }
    async addData(data) {
        return await this.#tableAction('add', data);
    }
    async getRow(idx) {
        try {
            if (idx < 0) {
                const count = await this.getCount();
                return await this.#tableAction('get', count + idx + 1);
            }
            return await this.#tableAction('get', idx + 1);
        }
        catch (e) {
            return undefined;
        }
    }
    async updateRow(idx, data) {
        const current = await this.getRow(idx) || {};
        const { assignGingerly } = await import('../lib/assignGingerly.js');
        await assignGingerly(current, data);
        return await this.#tableAction('put', current);
    }
    async getLastRow() {
        try {
            const count = await this.getCount();
            return await this.getRow(count - 1);
        }
        catch (e) {
            return undefined;
        }
    }
    async getCount() {
        return await this.#tableAction('count');
    }
    async getAllRows() {
        return await this.#tableAction('getAll');
    }
}
