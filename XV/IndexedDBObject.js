import { BaseIndexedDB } from "./BaseIndexedDB.js";
export class IndexedDBObject extends BaseIndexedDB {
    get dbOptions() {
        return { keyPath: 'key' };
    }
    async assign(obj) {
        const USLs = [];
        for (const key in obj) {
            await this.#setItem(key, obj[key]);
            USLs.push(`idb://${this.dbName}?.${this.storeName}?.${key}`);
        }
        postMessage(USLs);
    }
    async #setItem(key, value) {
        const resp = await this.idbAction('put', { key, value });
        return resp;
    }
    async getProperty(key) {
        return (await this.idbAction('get', key)).value;
    }
}
