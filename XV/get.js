import { getProp } from '../lib/getProp.js';
import { splitOnce } from '../lib/splitOnce.js';
export async function get(resourcePath) {
    const [protocol, path] = splitOnce(resourcePath, '://');
    const [usp, accessorChain] = splitOnce(path, '.?');
    const uspParts = usp.split('/');
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
