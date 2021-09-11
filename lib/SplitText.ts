import {PMDo, RenderContext} from './types.js';
import {getProp} from './getProp.js';


export class SplitText implements PMDo{
    do(ctx: RenderContext){
        const textNodes = ctx.rhs as string[];
        const host = ctx.host as any;
        if(host === undefined) throw "No host";
        if(textNodes.length === 1){
            const path = textNodes[0];
            ctx.target!.textContent = path === '.' ? host : getVal(host, path);
        }else{
            ctx.target!.textContent = interpolate(textNodes, host);
        }
        
    }
}

function getVal(host:any, path: string): string{
    const qSplit = path.split('??');
    const deflt = qSplit[1];
    const dSplit = qSplit[0].split('.');
    let val = getProp(host, dSplit);
    if(val === undefined && deflt){
        if(deflt[0] === "'"){
            return deflt.substr(1, deflt.length - 1);
        }else{
            return getVal(host, deflt);
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