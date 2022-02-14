import {PMDo, RenderContext} from './types.js';

import {lispToCamel} from './lispToCamel.js';

//TODO:  see if you using range, like be-searching does, makes things a little faster
export class SplitText implements PMDo{
    async do({host, target, rhs, key, ctx}: RenderContext){
        const toProp = this.getToProp(key) || 'textContent';

        if(rhs === '.') {
            (<any>target!)[toProp] = host as any as string;
            return;
        }
        if(typeof rhs === 'string'){
            (<any>target!)[toProp] = await getVal(host, rhs);
            return;
        }
        //rhs is an array, with first element a string
        (<any>target!)[toProp] = interpolate(rhs, host);
        
    }

    getToProp(key: string | undefined) {
        if(!key?.endsWith(']')) return;
        const iPos = key?.lastIndexOf('[');
        if (iPos === -1)
            return;
        key = key.replace('[data-data-', '[-');
        if (key[iPos + 1] !== '-')
            return;
        key = key.substring(iPos + 2, key.length - 1);
        return lispToCamel(key);
    }

    

}

export async function interpolate(textNodes: string[], host: any){
    return textNodes.map(async (path, idx) => {
        if(idx % 2 === 0) return path;
        return await getVal(host, path) as string;
    }).join('');
}

export async function getVal(host:any, path: string): Promise<string>{
    if(host === undefined) return path;
    if(path[0] !== '.') return host[path];
    //TODO:  cache this?
    path = path.substr(1);
    const qSplit = path.split('??');
    let deflt = qSplit[1];
    const dSplit = qSplit[0].trim().split('.');
    const {getProp} = await import('./getProp.js');
    let val = getProp(host, dSplit);
    if(val === undefined && deflt){
        deflt = deflt.trim();
        if(deflt[0] === "."){
            return getVal(host, deflt);
        }else{
            return deflt;
        }
    }
    return val;
}
