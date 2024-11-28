import { parse } from './parse.js';
export async function set(usl, val, ctx) {
    const parsedUSL = parse(usl);
    const { protocol, accessorChain, uspParts } = parsedUSL;
    switch (protocol) {
        case 'indexedDB': {
            const [dbName, storeName, propName] = uspParts;
            if (dbName === undefined || storeName === undefined || propName === undefined)
                throw 400;
            const { IndexedDBObject } = await import('./IndexedDBObject.js');
            const dbObj = new IndexedDBObject(dbName, storeName);
            await dbObj.openDB();
            const obj = { [`${propName}${accessorChain || ''}`]: val };
            dbObj.assign(obj, ctx);
            break;
        }
        case 'localStorage':
        case 'sessionStorage': {
            const { set } = await import('./Storage.js');
            const [key] = uspParts;
            let val2 = val;
            if (accessorChain !== undefined) {
                val2 = { [accessorChain]: val };
            }
            //const obj = 
            await set(key, protocol, val2, ctx);
            break;
        }
        case 'cookie': {
            const { set } = await import('./Cookie.js');
            const [key] = uspParts;
            await set(key, val);
            break;
        }
        case 'locationHash': {
            const { set } = await import('./hash.js');
            const [key] = uspParts;
            set(key, val);
            break;
        }
        default:
            throw 'NI';
    }
}
