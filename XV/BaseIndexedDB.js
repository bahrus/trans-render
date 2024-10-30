export class BaseIndexedDB {
    dbName;
    storeName;
    #db;
    get db() {
        return this.#db;
    }
    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
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
                    this.#db.createObjectStore(this.storeName, this.dbOptions);
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
    async idbAction(methodName, arg1, arg2) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
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
}
