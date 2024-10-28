import {BaseIndexedDB} from './BaseIndexedDB.js';
export class IndexedDBTable<TItem> extends BaseIndexedDB {






    async idbAction(methodName: 'add' | 'get' | 'getAll' | 'count' | 'put', arg1?: any, arg2?: any){
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store[methodName](arg1, arg2);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event: any) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }

    async addRow(data: TItem) {
        return await this.idbAction('add', data) as number;
    }

    async getRow(idx: number) {
        try{
            if(idx < 0){
                const count = await this.getCount();
                return await this.idbAction('get', count + idx + 1) as TItem;
            }
            return await this.idbAction('get', idx + 1) as TItem;
        }catch(e){
            return undefined;
        }
        
    }

    async updateRow(idx: number, data: TItem){
        const current = await this.getRow(idx) || {};
        const {assignGingerly} = await import('../lib/assignGingerly.js');
        await assignGingerly(current, data);
        return await this.idbAction('put', current)  as number;
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
        return await this.idbAction('count') as number;
    }

    async getAllRows(): Promise<any>{
        return await this.idbAction('getAll') as Array<TItem>;
    }
}