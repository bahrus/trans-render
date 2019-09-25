const sk = Symbol('sk'); //storage key
export function interpolate(target: any, prop: string, obj: any, isAttr: boolean = false){
    //const privateStorageKey = '__' + prop + '__split';
    let split = target[sk] as string[];
    if(split === undefined){
        const txt = isAttr ?  target.getAttribute(prop) : target[prop];
        split = txt.split('|');
        target[sk] = split;
    }
    const newVal = split.map((s, idx) => {
        if(s[0] === '.'){
            const chained = s.substr(1).split('??');
            const frstItem = obj[chained[0].trim()]; //todo trimend
            if(chained.length === 1) {
                return frstItem;
            }else{
                return (frstItem === undefined || frstItem === null) ? chained[1] : frstItem; 
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

