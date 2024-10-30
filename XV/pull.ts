import {protocols} from '../ts-refs/trans-render/env/types.js';
import {getProp} from '../lib/getProp.js';

export async function pull(resourcePath: `${protocols}://${string}`){
    const [protocol, path] = resourcePath.split('://', 2) as [protocols, string];
    const splitPath = path.split('?.');
    switch(protocol){
        case 'globalThis':
            return await getProp(globalThis, splitPath);
        case 'idb':
            const [dbName, storeName, propName, ...path] = splitPath;
            if(dbName === undefined || storeName === undefined || propName === undefined) throw 400;
            const {IndexedDBObject} = await import('./IndexedDBObject.js');
            const dbObj = new IndexedDBObject<any>(dbName, storeName);
            await dbObj.openDB();
            const obj = await dbObj.getProperty(propName);
            return path === undefined ? obj : await getProp(obj, path);
        case 'localStorage':
        case 'sessionStorage':
            const {pull} = await import('./Storage.js');
            return await pull(splitPath, protocol);

            
    }
}