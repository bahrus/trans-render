type nestedString = (string | string[])[];

const weakMap = new WeakMap<Element, nestedString>();

export function interpolate(target: any, prop: string, obj: any, isAttr: boolean = false){
    if(!isAttr){
        if(target.childNodes.length !== 1) return;
        if(target.childNodes[0].nodeType !== 3) return;
    }
    if(!weakMap.has(target as Element)){
        const txt = isAttr ?  target.getAttribute(prop) : target[prop] as string;
        const split = txt.split('|');
        if(split.length === 0) return;
        weakMap.set(target as Element, split.map(s =>{
            const optionalChain = (s as string).split('??'); //todo trimend only -- waiting for universal browser support
            return optionalChain.length === 1 ? optionalChain[0] : optionalChain;
        }) as (string | string[])[]);
    }
    const newVal = weakMap.get(target as Element)!.map((a: string | string[], idx: number) => {
        const isArray = Array.isArray(a);
        const s = isArray ? a[0] : a as string;
        if(s[0] === '.'){
            const frstItem = obj[s.substr(1).trim()]; 
            if(!isArray) {
                return frstItem;
            }else{
                return (frstItem === undefined || frstItem === null) ? a[1] : frstItem; 
            }
        } else{
            if(idx %2 === 1){
                return '|' + s + '|';
            }else{
                return s;
            }
            
        }
    }).join('');
    if(isAttr) {
        target.setAttribute(prop, newVal);
    }else{
        target[prop] = newVal;
    }
}



