import {PMDo, RenderContext} from './types.js';



export class SplitText implements PMDo{
    do(ctx: RenderContext){
        const textNodes = ctx.rhs as string[];
        const host = ctx.host as any;
        if(host === undefined) throw "No host";
        if(textNodes.length === 1){
            return host[textNodes[0]];
        }
        ctx.target!.textContent = interpolate(textNodes, host);
    }
}

export function interpolate(textNodes: string[], host: any){
    return textNodes.map((val, idx) => {
        if(idx % 2 === 0) return val;
        return host[val] as string;
    }).join('');
}