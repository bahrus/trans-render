import {protocols} from '../ts-refs/trans-render/env/types';
import {getProp} from '../lib/getProp.js';

export async function pull(resourcePath: `${protocols}://${string}`){
    const [protocol, path] = resourcePath.split('://', 2) as [protocols, string];
    const splitPath = path.split('.');
    switch(protocol){
        case 'globalThis':
            return await getProp(globalThis, splitPath) ;
        case 'idb':
            break;
        case 'session':
            
            break;
    }
}