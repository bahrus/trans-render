import { BaseIndexedDB } from "./BaseIndexedDB.js";
export class IndexedDBObject extends BaseIndexedDB {
    get dbOptions() {
        return { keyPath: 'key' };
    }
    async assign(obj) {
        for (const key in obj) {
            await this.#setItem(key, obj[key]);
        }
    }
    async #setItem(key, value) {
        const resp = await this.idbAction('put', { key, value });
        postMessage(`idb://${this.dbName}?.${this.storeName}?.${key}`);
        return resp;
    }
    async getProperty(key) {
        return (await this.idbAction('get', key)).value;
    }
}
