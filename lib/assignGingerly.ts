export function assignGingerly(dest: any, src: any){
    if(!src || typeof src !== 'object') return;
    const chainOps: any = {};
    const srcCopy = {...src};
    let doChains = false;
    for(const srcKey in src){
        if(srcKey.startsWith('?.')){
            doChains = true;
            chainOps[srcKey] = src[srcKey];
            delete srcCopy[srcKey]
        }
    }
    Object.assign(dest, srcCopy);
    applyChains(dest, chainOps);
}

async function applyChains(dest: any, chainOps: any){
    const {setProp} = await import('./setProp.js');
    for(const chainOpsKey in chainOps){
        const key = chainOpsKey.replaceAll('?.', '.');
        const val = chainOps[chainOpsKey];
        setProp(dest, key, val);
    }
}