import { camelToLisp } from "./camelToLisp.js";
import {QueryInfo, matchTypes} from './types';


const picaden: Set<string> = new Set(['P', 'I', 'C', 'A', 'D', 'E', 'N'])

const queryLookup = new Map<string, QueryInfo>();

export function getQuery(key: string): QueryInfo{
    if(queryLookup.has(key)) return queryLookup.get(key)!;
    let idx = 0;
    const backwardsIdx = Array.from(key).reverse().findIndex(c => picaden.has(c));
    if(backwardsIdx === -1 || key.indexOf('-') !== -1){
        const ret = {
            query: key,
            verb: 'querySelectorAll',
        } as QueryInfo;
        queryLookup.set(key, ret);
        return ret;
    }
    const matchIdx = key.length - 1 - backwardsIdx;
    const match = key[matchIdx]; 
    const attrib = camelToLisp(key.substring(0, matchIdx));
    let query: string | undefined;
    let verb: 'querySelectorAll' | 'querySelector' = 'querySelectorAll';
    const single = 'querySelector';
    let first = false;
    let lhsProp = '';
    const lastLetter = key.at(-1);
    const isPlural = lastLetter === 's';
    switch(match){
        case 'P':
            query = `[part~="${attrib}"]`;
            break;
        case 'C':
            query = `.${attrib}`;
            break;
        case 'A':
            query = `[${attrib}]`;
            break;
        case 'E':
            query = attrib;
            break;
        case 'N':
            query = `[name="${attrib}"]`;
            break;
        case 'I':
            if(isPlural || lastLetter !== 'd'){
                query = `[itemprop="${attrib}"]`;
            }else{
                query = '#' + attrib;
                verb = single;
                first = true;
            }
            break;
        case "D":
            query = `[-${attrib}]`;
            lhsProp = attrib;
            break;

    }
    
    if(!isPlural){
        verb = single;
        first = true;
    }
    
    const q = {query, match, attrib, lhsProp, verb} as QueryInfo;
    queryLookup.set(key, q);
    return q;

}