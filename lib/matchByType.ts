export function matchByType(val: any, typOfProcessor: any){
    if(typOfProcessor === undefined) return 0;
    switch(typeof val){
        case 'object':
            return val instanceof typOfProcessor ? 1 : -1; 
        case 'string':
            return typOfProcessor === String ? 1 : -1;
        case 'number':
            return typOfProcessor === Number ? 1 : -1;
        case 'boolean':
            return typOfProcessor === Boolean ? 1 : -1;
        case 'symbol':
            return typOfProcessor === Symbol ? 1 : -1;
        case 'bigint':
            return typOfProcessor === BigInt ? 1 : -1;
    }
    return 0;    
}