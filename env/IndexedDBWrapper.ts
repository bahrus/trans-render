
export class IndexedDBWrapper {
    #db: any;
    constructor(public dbName: string, public version: number){
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

    async #tableAction(storeName: string, methodName: 'add' | 'get' | 'count' | 'put', arg1?: any, arg2?: any){
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store[methodName](arg1, arg2);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event: any) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }

    async addData(storeName: string, data: any, key?: number) {
        return await this.#tableAction(storeName, 'add', data, key);
    }

    async getRow(storeName: string, idx: number) {
        try{
            if(idx < 0){
                const count = await this.getCount(storeName);
                return await this.#tableAction(storeName, 'get', count + idx + 1);
            }
            return await this.#tableAction(storeName, 'get', idx + 1);
        }catch(e){
            return undefined;
        }
        
    }

    async updateData(storeName: string, key: number, data: any){
        const current = await this.getRow(storeName, key) || {};
        const {assignGingerly} = await import('../lib/assignGingerly.js');
        await assignGingerly(current, data);
        return await this.#tableAction(storeName, 'put', current);
    }

    async getLatest(storeName: string){
        try{
            const count = await this.getCount(storeName);
            return await this.getRow(storeName, count - 1);
        }catch(e){
            return undefined;
        }
        
    }

    async getCount(storeName: string): Promise<number>{
        return await this.#tableAction(storeName, 'count') as number;
    }
}