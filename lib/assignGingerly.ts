export async function assignGingerly(dest: any, src: any){
    if(!src || typeof src !== 'object') return;
    const chainOps: any = {};
    const srcCopy = {...src};
    let doChains = false;
    for(const srcKey in src){
        if(srcKey.startsWith('?.')){
            doChains = true;
            chainOps[srcKey] = src[srcKey];
            delete srcCopy[srcKey];
            continue;
        }else if(srcKey === '...'){
            const guid = src[srcKey];
            const {when} = await import('./weave.js');
            const values = await when(guid);
            await assignGingerly(dest, values);
            continue;
        }else if(dest instanceof Element && srcKey.startsWith('${')){
            //find next } and do a querySelector on the dest element and recursively call assignGingerly
            const end = srcKey.indexOf('}');
            const selector = srcKey.substring(2, end);
            const el = dest.querySelector(selector);
            if(el){
                await assignGingerly(el, src);
            }else{
                //console.warn(`Element not found using selector: ${selector}`);
            }
            continue;
        }
        //if target prop exists and isn't an instance of a class,  but the src prop is of type EventType
        //merge what is there first...
        //if target prop is of type EventType and src prop isn't an instance of a class, merge it in.
        const destProp = dest[srcKey];
        const srcProp = srcCopy[srcKey];
        if(destProp instanceof Object && destProp.constructor === Object && srcProp instanceof EventTarget){
            await assignGingerly(srcProp, destProp);
        }else if(destProp instanceof EventTarget && srcProp instanceof Object && srcProp.constructor === Object){
            await assignGingerly(destProp, srcProp);
            continue;
        }else if(srcProp instanceof Object && ('...' in srcProp)){
            if(destProp === undefined){
                dest[srcKey] = {}
            }
            await assignGingerly(dest[srcKey], srcProp);
            continue;
        }
        dest[srcKey] = srcProp;
    }
    //Object.assign(dest, srcCopy);
    await applyChains(dest, chainOps);
}

async function applyChains(dest: any, chainOps: any){
    // const {setProp} = await import('./setProp.js');
    for(const chainOpsKey in chainOps){
        const val = chainOps[chainOpsKey];
        const split = chainOpsKey.split('?.');
        let context = dest;
        const last = split.pop()!;
        split.shift();
        for(const token of split){
            let newContext = context[token];
            if(newContext === undefined){
                const newMethod = `new${token[0].toUpperCase()}${token.substring(1)}`;
                let obj: any;
                if(newMethod in context){
                    obj = await context[newMethod]();
                }else{
                    obj = {};
                    
                }
                context[token] = obj;
                context = obj;
            }else{
                context = newContext;
            }
        }
        if(typeof(context[last]) === 'object' && typeof(val) === 'object'){
            await assignGingerly(context[last], val);
        }else{
            context[last] = val;
        }
    }
}