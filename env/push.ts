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
                    const req = indexedDB.open(storeName, 1);
                    req.addEventListener('upgradeneeded', e => {
                        console.log('iah');
                        const dbe = (e as any).target.result;
                        dbe.createObjectStore(storeName, { keyPath: 'id' });
                    });
                    const transaction = db.transaction(storeName, 'readwrite');
                    const objectStore = transaction.objectStore(storeName);
                    const existingObj = await (await import('./pull.js')).pull(resourcePath) || {};
                    await assignGingerly(existingObj, val);
                    objectStore.add(existingObj);
                    let evt: any;
                    try{
                        evt = await (await import('../lib/waitForEvent.js')).waitForEvent(req, 'success', 'error') as any;
                    }catch(err){
                        console.log({err});
                    }
                    
                    const db = evt.target.result;
                    
                    break;
                    

            }
            
    }
}