import {PMDo, RenderContext} from './types.js';
import {getProp} from './getProp.js';


export class SplitText implements PMDo{
    do({host, target, rhs}: RenderContext){
        const textNodes =  typeof rhs === 'string' ? [rhs] : rhs as string[];
        //const host = ctx.host as any;
        if(host === undefined) {
            target!.textContent = textNodes[0];
            return;
        }
        if(textNodes.length === 1){
            const path = textNodes[0];
            target!.textContent = path === '.' ? host as any : getVal(host, path);
        }else{
            target!.textContent = interpolate(textNodes, host);
        }
        
    }
}

export function getVal(host:any, path: string): string{
    if(path[0] !== '.') return host[path];
    path = path.substr(1);
    const qSplit = path.split('??');
    const deflt = qSplit[1];
    const dSplit = qSplit[0].split('.');
    let val = getProp(host, dSplit);
    if(val === undefined && deflt){
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