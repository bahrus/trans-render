import {PMDo, RenderContext} from './types.js';
import {getProp} from './getProp.js';


export class SplitText implements PMDo{
    do({host, target, rhs}: RenderContext){
        if(rhs === '.') {
            target!.textContent = host as any as string;
            return;
        }
        if(typeof rhs === 'string'){
            target!.textContent = getVal(host, rhs);
            return;
        }

        target!.textContent = interpolate(rhs, host);
        
    }
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

export function interpolate(textNodes: string[], host: any){
    return textNodes.map((path, idx) => {
        if(idx % 2 === 0) return path;
        return getVal(host, path) as string;
    }).join('');
}