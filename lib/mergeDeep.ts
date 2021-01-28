/**
 * Deep merge two objects.
 * Inspired by Stackoverflow.com/questions/27936772/deep-object-merging-in-es6-es7
 * @param target
 * @param source
 * 
 */
export function mergeDeep(target : any, source: any) {
    if (typeof target !== 'object') return;
    if (typeof source !== 'object') return;
    for (const key in source) {
        processKey(key, target, source);
    }
    Object.getOwnPropertySymbols(source).forEach(sym =>{
        processKey(sym, target, source);
    })
    //TODO:  support symbols
    return target;
}

function processKey(key: string | symbol, target : any, source: any){
    const sourceVal = source[key];
    const targetVal = target[key];
    if (sourceVal === null || sourceVal === undefined) return; //TODO:  null out property?
    if (!targetVal) {
        target[key] = sourceVal;
        return;
    }

    switch (typeof sourceVal) {
        case 'object':
            switch (typeof targetVal) {
                case 'object':
                    mergeDeep(targetVal, sourceVal);
                    break;
                default:
                    //console.log(key);
                    target[key] = sourceVal;
                    break;
            }
            break;
        default:
            target[key] = sourceVal;
    }
}