export function freeze(content: DocumentFragment | Element, beHive: Element){
    const decoratorElements = Array.from(beHive.children) as any[];
    for(const decorEl of decoratorElements){
        const ifWantsToBe = (decorEl as any as Element).getAttribute('if-wants-to-be');
        if(ifWantsToBe === undefined) continue;
        const isAttr = 'is-' + ifWantsToBe;
        const beAttr = 'be-' + ifWantsToBe;
        const converted = Array.from(content.querySelectorAll(`[${isAttr}]`));
        for(const el of converted){
            const currVal = decorEl.virtualPropsMap.get(el);
            el.removeAttribute(isAttr);
            const vpm = decorEl.virtualPropsMap;
            let attrVal = '';
            if(vpm !== undefined){
                const currVal = vpm.get(el);
                attrVal = JSON.stringify(currVal);
            }else{
                console.warn('ploi');//potential loss of information
            }
            el.setAttribute(beAttr, attrVal);
        }
    }
}

export function beFrozen(element: Element){
    const beHive = (element.getRootNode() as ShadowRoot).querySelector('be-hive') as Element;
    freeze(element, beHive);
}