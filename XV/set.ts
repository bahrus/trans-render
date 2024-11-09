import { USL } from "../ts-refs/trans-render/XV/types";
import {parse} from './parse.js';

export async function set(usl: USL, val: any){
    const parsedUSL = parse(usl);
    const {protocol, accessorChain, uspParts} = parsedUSL;
    switch(protocol){
        case 'indexedDB':
            const [dbName, storeName, propName] = uspParts;
            if(dbName === undefined || storeName === undefined || propName === undefined) throw 400;
            const {IndexedDBObject} = await import('./IndexedDBObject.js');
            const dbObj = new IndexedDBObject<any>(dbName, storeName);
            await dbObj.openDB();
            const obj = {[accessorChain]: val};
            dbObj.assign(obj);
            break;
        case 'localStorage':
        case 'sessionStorage':
            const {set} = await import('./Storage.js');
            const [key] = uspParts;
            await set(key, protocol, val);
            throw 'NI';
        default:
            throw 'NI';
    }    
}