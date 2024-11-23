import { BaseIndexedDB } from "./BaseIndexedDB.js";
export class IndexedDBObject extends BaseIndexedDB {
    get dbOptions() {
        return { keyPath: 'key' };
    }
    async assign(obj, ctx) {
        const USLs = ctx?.USLs ?? new Set();
        for (const key in obj) {
            await this.#setItem(key, obj[key]);
            const protocol = 'indexedDB';
            USLs.add(protocol);
            const root = `${protocol}://${this.dbName}/${this.storeName}`;
            USLs.add(root);
            const usl = `${root}/${key}`;
            USLs.add(usl);
        }
        if (ctx === undefined) {
            postMessage(USLs);
        }
    }
    async #setItem(key, value) {
        const resp = await this.idbAction('put', { key, value });
        return resp;
    }
    async getProperty(key) {
        return (await this.idbAction('get', key)).value;
    }
}
