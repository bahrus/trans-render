export class IndexedDBWrapper {
    #db: any;
    constructor(public dbName: string, public tableName: string, public version: number){
        this.#db = null;
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event: any) => {
                this.#db = event.target.result;
                if (!this.#db.objectStoreNames.contains(this.tableName)) {
                    this.#db.createObjectStore(this.tableName, { keyPath: 'id', autoIncrement: true });
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

    async #tableAction(methodName: 'add' | 'get' | 'getAll' | 'count' | 'put', arg1?: any, arg2?: any){
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.tableName], 'readwrite');
            const store = transaction.objectStore(this.tableName);
            const request = store[methodName](arg1, arg2);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event: any) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }

    async addData(data: any) {
        return await this.#tableAction('add', data);
    }

    async getRow(idx: number) {
        try{
            if(idx < 0){
                const count = await this.getCount();
                return await this.#tableAction('get', count + idx + 1);
            }
            return await this.#tableAction('get', idx + 1);
        }catch(e){
            return undefined;
        }
        
    }

    async updateRow(idx: number, data: any){
        const current = await this.getRow(idx) || {};
        const {assignGingerly} = await import('../lib/assignGingerly.js');
        await assignGingerly(current, data);
        return await this.#tableAction('put', current);
    }

    async getLastRow(){
        try{
            const count = await this.getCount();
            return await this.getRow(count - 1);
        }catch(e){
            return undefined;
        }
        
    }

    async getCount(): Promise<number>{
        return await this.#tableAction('count') as number;
    }

    async getAllRows(): Promise<any>{
        return await this.#tableAction('getAll');
    }
}