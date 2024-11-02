import { getProp } from '../lib/getProp.js';
import { parse } from './parse.js';
export async function get(usl) {
    const parsedUSL = parse(usl);
    const { protocol, usp, accessorChain, uspParts } = parsedUSL;
    let ctxObj;
    switch (protocol) {
        // case 'globalThis':
        //     return await getProp(globalThis, splitPath);
        case 'indexedDB':
            const [dbName, storeName, propName] = uspParts;
            if (dbName === undefined || storeName === undefined || propName === undefined)
                throw 400;
            const { IndexedDBObject } = await import('./IndexedDBObject.js');
            const dbObj = new IndexedDBObject(dbName, storeName);
            await dbObj.openDB();
            ctxObj = await dbObj.getProperty(propName);
            break;
        case 'localStorage':
        case 'sessionStorage':
            const { pull } = await import('./Storage.js');
            ctxObj = await pull(uspParts, protocol);
            break;
    }
    if (accessorChain !== undefined) {
        const splitAccessorChain = accessorChain.split('?.');
        ctxObj = getProp(ctxObj, splitAccessorChain);
    }
    return ctxObj;
}
