import {protocols} from '../ts-refs/trans-render/env/types';
import {assignGingerly} from '../lib/assignGingerly.js';

export async function push(resourcePath: `${protocols}://${string}`, val: any){
    const [protocol, path] = resourcePath.split('://', 2) as [protocols, string];
    switch(protocol){
        case 'globalThis':
            await assignGingerly(globalThis, val);
            return;
        case 'session':
        case 'idb':
            const splitPath = path.split('?.');
            const storeName = splitPath.shift();
            if(storeName === undefined) throw 400;
            switch(protocol){
                case 'idb':
                    const existingObj = await (await import('./pull.js')).pull(resourcePath) || {};
                    await assignGingerly(existingObj, val);
                    const req = indexedDB.open(storeName, 3);
                    const evt = (await import('../lib/waitForEvent.js')).waitForEvent(req, 'success', 'error') as any;
                    const db = evt.target.result;
                    const transaction = db.transaction([storeName], 'readonly');
                    const objectStore = transaction.objectStore(storeName);
                    objectStore.add(existingObj);
                    break;
            }
            
    }
}