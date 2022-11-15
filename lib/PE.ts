import {PMDo, RenderContext, PEUnionSettings, PSettings} from './types.js';

export class PE implements PMDo{
    async do(ctx: RenderContext){
        const {host} = ctx;
        if(host=== undefined) throw 'Unknown host.';
        const {rhs} = ctx;
        const e = rhs![1];

        const prevRHS = {...ctx.rhs};
        const {modifyPRHS} = await import('./P.js');
        const modifiedProps = await modifyPRHS(ctx, 0);
        const {target} = ctx;
        if(typeof e === 'string'){
            const eventName = target!.localName === 'input' ? 'input' :  'click';
            target!.addEventListener(eventName, ev => {
                (<any>target)[e](host, ev);
            });
            const {applyP} = await import('./applyP.js');
            await applyP(target!, [modifiedProps] as PSettings);
        }else{
            const modifiedEvents = await modifyERHS(ctx, 1);
            const {applyPE} = await import('./applyPE.js');
            await applyPE(host, target as HTMLElement, [modifiedProps, modifiedEvents] as PEUnionSettings);
        }
        
        ctx.rhs = prevRHS;
    }
}

export function modifyERHS(ctx: RenderContext, idx: number){
    const rhs = ctx.rhs![idx];
    if(rhs === undefined) return;
    const modifiedRHS: any = {};
    for(const key in rhs){
        let val = modifyVal(key, rhs, ctx);
        modifiedRHS[key] = val;
    }
    const newRHS = [...ctx.rhs];
    newRHS[idx] = modifiedRHS;
    ctx.rhs = newRHS;
    return modifiedRHS;
}

export function modifyVal(key: string, rhs: any, ctx: RenderContext){
    let val = rhs[key];
    const host = ctx.host! as any;
    if(host === undefined) return val;
    switch(typeof val){
        case 'string':
            return gFn(host, val);
        case 'object':
            if(Array.isArray(val)){
                const newVal = [];
                let idx = 0;
                for(const part of val){
                    let newPart = part;
                    switch(idx){
                        case 0:
                        case 2:
                            newPart = gFn(host, part);
                            break;
                    }
                    newVal.push(newPart);
                    idx++;
                }
                return newVal;
            }else{
                for(const subKey in val){
                    const subVal = val[subKey];
                    if(Array.isArray(subVal)){
                        throw 'TR.PE.NI'; //Not implemented
                        // const newVal = [];
                        // let idx = 0;
                        // for(const part of val){
                        //     let newPart = part;
                        //     switch(idx){
                        //         case 0:
                        //         case 2:
                        //             newPart = gFn(host, part);
                        //             break;
                        //     }
                        //     newVal.push(newPart);
                        //     idx++;
                        // }
                        // val[subKey] = newVal;                    
                    }
                }
            }
        
    }
    return val;
}

function gFn(host: any, val: string){
    return host[val] || (<any>self)[val] || val;
}