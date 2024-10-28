import { BaseIndexedDB } from './BaseIndexedDB.js';
export class IndexedDBTable extends BaseIndexedDB {
    get dbOptions() {
        return { keyPath: 'id', autoIncrement: true };
    }
    async addRow(data) {
        return await this.idbAction('add', data);
    }
    async getRow(idx) {
        try {
            if (idx < 0) {
                const count = await this.getCount();
                return await this.idbAction('get', count + idx + 1);
            }
            return await this.idbAction('get', idx + 1);
        }
        catch (e) {
            return undefined;
        }
    }
    async updateRow(idx, data) {
        const current = await this.getRow(idx) || {};
        const { assignGingerly } = await import('../lib/assignGingerly.js');
        await assignGingerly(current, data);
        return await this.idbAction('put', current);
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
        return await this.idbAction('count');
    }
    async getAllRows() {
        return await this.idbAction('getAll');
    }
}
