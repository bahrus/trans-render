import { RenderContext, Transformer } from "./types";

export async function doAngleBracket(ctx: RenderContext, sup: (ctx: RenderContext) => void){
    const {target, host, rhs} = ctx;
    const method = host[rhs];
    if(typeof method === 'function'){
        await method(ctx);
    }else{
        sup(ctx);
    }
}