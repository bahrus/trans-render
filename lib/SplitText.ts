import {PMDo, RenderContext} from './types.js';



export class SplitText implements PMDo{
    do(ctx: RenderContext){
        const textNodes = ctx.rhs as string[];
        const host = ctx.host as any;
        if(host === undefined) throw "No host";
        const evNodes = textNodes.map((val, idx) => {
            if(idx % 2 === 0) return val;
            return host[val] as string;
        });
        ctx.target!.textContent = evNodes.join('');
    }
}