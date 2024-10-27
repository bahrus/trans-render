
export class IndexedDBWrapper extends EventTarget {
    #db: any;
    constructor(public dbName: string, public version: number){
        super();
        this.#db = null;
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event: any) => {
                this.#db = event.target.result;
                if (!this.#db.objectStoreNames.contains('store')) {
                    this.#db.createObjectStore('store', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event: any) => {
                this.#db = event.target.result;
                resolve(this.#db);
            };

            request.onerror = (event: any) => {
                reject(`Database error: ${event.target.errorCode}`);
            };
        });
    }

    async addData(storeName: string, data: any) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event: any) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }

    async getData(storeName: string, key: number) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([storeName]);
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event: any) => {
                reject(`Get error: ${event.target.errorCode}`);
            };
        });
    }

    async getLatest(storeName: string){
        const count = await this.getCount(storeName);
        return await this.getData(storeName, count);
    }

    async getCount(storeName: string): Promise<number>{
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([storeName]);
            const store = transaction.objectStore(storeName);
            const request = store.count();
            request.addEventListener('success', (e: any) => {
                console.log({e});
            })
            request.onsuccess = () => {
                resolve(request.result as number);
            };

            request.onerror = (event: any) => {
                reject(`Get error: ${event.target.errorCode}`);
            };
        });
    }
}