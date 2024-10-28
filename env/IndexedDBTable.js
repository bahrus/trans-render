export class IndexedDBTable {
    dbName;
    storeName;
    version;
    #db;
    constructor(dbName, storeName, version) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
    }
    async openDB() {
        let version = 1;
        while (true) {
            try {
                await this.openDBVersion(version);
                return;
            }
            catch {
                version++;
            }
        }
    }
    async openDBVersion(version) {
        //const dbs = (await indexedDB.databases()).filter(x => x.name === this.dbName);
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, version);
            request.onupgradeneeded = (event) => {
                this.#db = event.target.result;
                if (!this.#db.objectStoreNames.contains(this.storeName)) {
                    this.#db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = async (event) => {
                const db = event.target.result;
                if (db.objectStoreNames.contains(this.storeName)) {
                    this.#db = db;
                    resolve(db);
                }
                else {
                    reject();
                }
            };
            request.onerror = (event) => {
                reject(`Database error: ${event.target.errorCode}`);
            };
        });
    }
    async #tableAction(methodName, arg1, arg2) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store[methodName](arg1, arg2);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }
    async addRow(data) {
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
