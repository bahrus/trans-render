export function assignGingerly(dest: any, src: any){
    if(!src || typeof src !== 'object') return;
    const chainOps: any = {};
    const srcCopy = {...src};
    let doChains = false;
    for(const srcKey in src){
        if(srcKey.startsWith('?.')){
            doChains = true;
            chainOps[srcKey] = src[srcKey];
            delete srcCopy[srcKey];
        }
        //if target prop exists and isn't an instance of a class,  but the src prop is of type EventType
        //merge what is there first...
        //if target prop is of type EventType and src prop isn't an instance of a class, merge it in.
        const destProp = dest[srcKey];
        const srcProp = srcCopy[srcKey];
        if(destProp instanceof Object && destProp.constructor === Object && srcProp instanceof EventTarget){
            assignGingerly(srcProp, destProp);
        }else if(destProp instanceof EventTarget && srcProp instanceof Object && srcProp.constructor === Object){
            assignGingerly(destProp, srcProp);
            continue;
        }
        dest[srcKey] = srcProp;
    }
    //Object.assign(dest, srcCopy);
    applyChains(dest, chainOps);
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
            }
        }
        if(typeof(context[last]) === 'object' && typeof(val) === 'object'){
            await assignGingerly(context[last], val);
        }else{
            context[last] = val;
        }
    }
}