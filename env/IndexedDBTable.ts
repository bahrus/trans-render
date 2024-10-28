import {BaseIndexedDB} from './BaseIndexedDB.js';
export class IndexedDBTable<TItem> extends BaseIndexedDB {

    get dbOptions(){
        return { keyPath: 'id', autoIncrement: true }
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