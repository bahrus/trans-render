export async function doUpdate(transformer, matchingElement, uow) {
    const { d, o, s, sa, i, ss, invoke, f, negTo } = uow;
    if (i !== undefined) {
        const valOfIf = await transformer.doIfs(matchingElement, uow, i);
        if (!valOfIf)
            return;
    }
    if (typeof s === 'object') {
        if ('hidden' in s && matchingElement instanceof HTMLTemplateElement) {
            const val = s['hidden'];
            switch (val) {
                case false:
                    const { hatchOrFind } = await import('../lib/hatchOrFind.js');
                    const response = await hatchOrFind(matchingElement);
                    const { elements, state } = response;
                    if (state === 'found') {
                        for (const element of elements) {
                            if (element instanceof HTMLElement) {
                                element.hidden = false;
                            }
                            else {
                                throw 'NI';
                            }
                        }
                    }
                    break;
                case true:
                    if (matchingElement.hasAttribute('itemref')) {
                        const { hatchOrFind } = await import('../lib/hatchOrFind.js');
                        const response = await hatchOrFind(matchingElement);
                        const { elements, state } = response;
                        for (const element of elements) {
                            if (element instanceof HTMLElement) {
                                element.hidden = true;
                            }
                            else {
                                throw 'NI';
                            }
                        }
                        break;
                    }
            }
            const withoutHidden = { ...s };
            delete withoutHidden.hidden;
            Object.assign(matchingElement, withoutHidden);
            return;
        }
        Object.assign(matchingElement, s);
        return;
    }
    ;
    if (f !== undefined) {
        const { forEachImpls } = await import('./ForEachImpl.js');
        const forEachImpl = forEachImpls.get(matchingElement);
        const { model } = transformer;
        const subModel = model[o[0]];
        if (forEachImpl !== undefined) {
            await forEachImpl.update(subModel);
        }
        return;
    }
    //let val: any;
    if (d === undefined)
        throw 'NI';
    const val = await transformer.getDerivedVal(uow, d, matchingElement);
    if (negTo !== undefined) {
        const path = negTo;
        await setPath(matchingElement, path, !val);
    }
    else if (s !== undefined) {
        const path = s;
        await setPath(matchingElement, path, val);
    }
    else if (sa !== undefined) {
        const { A } = await import('./A.js');
        A({ [sa]: val }, matchingElement);
    }
    else if (ss !== undefined) {
        const { setProp } = await import('../lib/setProp.js');
        setProp(matchingElement.style, ss, val);
        //A({[ss]: val}, (matchingElement as HTMLElement).style);
    }
    else if (invoke !== undefined) {
        await matchingElement[invoke](val);
    }
    else {
        const { ASMR } = await import('../asmr/asmr.js');
        const so = await ASMR.getSO(matchingElement);
        so.setValue(val);
        //transformer.setPrimeValue(matchingElement, val);
    }
}
async function setPath(matchingElement, path, val) {
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
            matchingElement[path] = val;
    }
}
