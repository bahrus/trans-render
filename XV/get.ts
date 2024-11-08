import {USL} from '../ts-refs/trans-render/XV/types.js';
import {getProp} from '../lib/getProp.js';
import {parse} from './parse.js';

export async function get(usl: USL){
    const parsedUSL = parse(usl);
    const {protocol, accessorChain, uspParts} = parsedUSL;
    let ctxObj: any;
    switch(protocol){
        // case 'globalThis':
        //     return await getProp(globalThis, splitPath);
        case 'indexedDB':
            const [dbName, storeName, propName] = uspParts;
            if(dbName === undefined || storeName === undefined || propName === undefined) throw 400;
            const {IndexedDBObject} = await import('./IndexedDBObject.js');
            const dbObj = new IndexedDBObject<any>(dbName, storeName);
            await dbObj.openDB();
            ctxObj = await dbObj.getProperty(propName);
            break;
        case 'localStorage':
        case 'sessionStorage':
            const {get} = await import('./Storage.js');
            const [key] = uspParts;
            
            ctxObj = await get(key, protocol);
            break;
        default:
            throw 'NI';
            
    }
    if(accessorChain !== undefined){
        const splitAccessorChain = accessorChain.split('?.');
        ctxObj = getProp(ctxObj, splitAccessorChain);
    }
    return ctxObj;

}