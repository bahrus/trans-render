import {protocols} from '../ts-refs/trans-render/env/types';
import {assignGingerly} from '../lib/assignGingerly.js';

export async function push(resourcePath: `${protocols}://${string}`, val: any){
    const [protocol, path] = resourcePath.split('://', 2) as [protocols, string];
    switch(protocol){
        case 'globalThis':
            await assignGingerly(globalThis, path);
            return;
        case 'idb':
            const existingObj = await (await import('./pull.js')).pull(resourcePath) || {};
            await assignGingerly(existingObj, val);
            
    }
}