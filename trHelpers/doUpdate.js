export async function doUpdate(transformer, matchingElement, uow) {
    const { d, o, s, sa, i, ss } = uow;
    if (i !== undefined) {
        const valOfIf = await transformer.doIfs(matchingElement, uow, i);
        if (!valOfIf)
            return;
    }
    // if(o === undefined){
    //     if(s === undefined) throw 'NI';
    //     Object.assign(matchingElement, s);
    //     return;
    // }
    if (typeof s === 'object') {
        Object.assign(matchingElement, s);
        return;
    }
    ;
    //let val: any;
    if (d === undefined)
        throw 'NI';
    const val = await transformer.getDerivedVal(uow, d, matchingElement);
    if (s !== undefined) {
        const path = s;
        switch (path[0]) {
            case '.':
                const { setProp } = await import('../lib/setProp.js');
                setProp(matchingElement, path, val);
                break;
            case '+':
                const { setEnhProp } = await import('../lib/setEnhProp.js');
                setEnhProp(matchingElement, path, val);
                break;
            default:
                matchingElement[s] = val;
        }
    }
    else if (sa !== undefined) {
        const { A } = await import('../froop/A.js');
        A({ [sa]: val }, matchingElement);
    }
    else if (ss !== undefined) {
        const { setProp } = await import('../lib/setProp.js');
        setProp(matchingElement.style, ss, val);
        //A({[ss]: val}, (matchingElement as HTMLElement).style);
    }
    else {
        transformer.setPrimeValue(matchingElement, val);
    }
}
