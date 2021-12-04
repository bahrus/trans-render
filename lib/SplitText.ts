import {PMDo, RenderContext} from './types.js';
import {getProp} from './getProp.js';
import {lispToCamel} from './lispToCamel.js';

export class SplitText implements PMDo{
    do({host, target, rhs, key, ctx}: RenderContext){
        const toProp = this.getToProp(key) || 'textContent';

        if(rhs === '.') {
            (<any>target!)[toProp] = host as any as string;
            return;
        }
        if(typeof rhs === 'string'){
            (<any>target!)[toProp] = getVal(host, rhs);
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

export function interpolate(textNodes: string[], host: any){
    return textNodes.map((path, idx) => {
        if(idx % 2 === 0) return path;
        return getVal(host, path) as string;
    }).join('');
}

export function getVal(host:any, path: string): string{
    if(host === undefined) return path;
    if(path[0] !== '.') return host[path];
    path = path.substr(1);
    const qSplit = path.split('??');
    let deflt = qSplit[1];
    const dSplit = qSplit[0].trim().split('.');
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
