import { parse } from './parse.js';
export async function set(usl, val) {
    const parsedUSL = parse(usl);
    const { protocol, accessorChain, uspParts } = parsedUSL;
    switch (protocol) {
        case 'indexedDB':
            const [dbName, storeName, propName] = uspParts;
            if (dbName === undefined || storeName === undefined || propName === undefined)
                throw 400;
            const { IndexedDBObject } = await import('./IndexedDBObject.js');
            const dbObj = new IndexedDBObject(dbName, storeName);
            await dbObj.openDB();
            const obj = { [accessorChain]: val };
            dbObj.assign(obj);
            break;
    }
}
