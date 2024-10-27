
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

    async #tableAction(tableName: string, methodName: 'add' | 'get' | 'count' | 'put', arg1?: any, arg2?: any){
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            const request = store[methodName](arg1, arg2);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event: any) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }

    async addData(tableName: string, data: any, key?: number) {
        return await this.#tableAction(tableName, 'add', data, key);
    }

    async getRow(tableName: string, idx: number) {
        try{
            if(idx < 0){
                const count = await this.getCount(tableName);
                return await this.#tableAction(tableName, 'get', count + idx + 1);
            }
            return await this.#tableAction(tableName, 'get', idx + 1);
        }catch(e){
            return undefined;
        }
        
    }

    async updateData(tableName: string, key: number, data: any){
        const current = await this.getRow(tableName, key) || {};
        const {assignGingerly} = await import('../lib/assignGingerly.js');
        await assignGingerly(current, data);
        return await this.#tableAction(tableName, 'put', current);
    }

    async getLastRow(tableName: string){
        try{
            const count = await this.getCount(tableName);
            return await this.getRow(tableName, count - 1);
        }catch(e){
            return undefined;
        }
        
    }

    async getCount(tableName: string): Promise<number>{
        return await this.#tableAction(tableName, 'count') as number;
    }
}