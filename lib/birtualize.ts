
/**
 * "Expand" HTMLTemplateElement by replacing special tags with referenced templates
 * @param templ 
 * @param templLookup 
 */
export async function birtualize(templ: HTMLTemplateElement, templRefs: {[key: string]: HTMLTemplateElement}, templLookup: (key: string) => HTMLTemplateElement | undefined){
    if(templ.dataset.birtualized) return;
    const {content} = templ;
    const bis = content.querySelectorAll('b-i');
    for(const bi of bis){
        const {children} = bi;
        const href = bi.getAttribute('href')?.replace('#', '');
        if(!href) continue;
        const hasChildren = children.length > 0;
        const slotLookup = new Map<string, Element[]>();
        if(hasChildren){
            const childrenArr = Array.from(children);
            for(const child of childrenArr){
                const slot = child.getAttribute('slot-bot');
                if(slot === null) continue; //TODO:  slots with no names
                if(!slotLookup.has(slot)){
                    slotLookup.set(slot, []);
                }
                const arr = slotLookup.get(slot);
                arr?.push(child);
            }
        }
        let referencedTempl: HTMLTemplateElement | undefined = templRefs[href];
        if(referencedTempl === undefined){
            referencedTempl = templLookup(href);
            if(referencedTempl === undefined) continue;
            templRefs[href] = referencedTempl;
        }
        
        
        await birtualize(referencedTempl!, templRefs, templLookup);
        const clone = document.importNode(referencedTempl!.content, true);
        if(hasChildren){
            const slots = slotLookup.keys();
            for(const slot of slots){
                const slotTarget = clone.querySelector(`slot-bot[name="${slot}"]`);
                if(slotTarget === null) continue;
                slotTarget.innerHTML = ''; // fallback
                for(const matchingChild of slotLookup.get(slot)!){
                    matchingChild.removeAttribute('slot-bot');
                    slotTarget.appendChild(matchingChild)
                }
            }
        }
        
        const parentElement = bi.parentElement;
        const hintTempl = document.createElement('template');
        hintTempl.dataset.ref = href;
        hintTempl.dataset.cnt = (clone.childNodes.length + 1).toString(); // includes text nodes, to match what insertAdjacentClone does now
        const names = bi.getAttributeNames();
        for(const name of names){
            if(name === 'bi') continue;
            hintTempl.setAttribute(name, bi.getAttribute(name)!)
        }
        const hasSibling = bi.nextElementSibling !== null;
        bi.insertAdjacentElement('afterend', hintTempl);
        if(parentElement !== null && !hasSibling){
            parentElement.append(clone);
        }else{
            const {insertAdjacentClone} = await import('./insertAdjacentClone.js');
            insertAdjacentClone(clone, hintTempl, 'afterend');
        }
        bi.remove();
    };
    templ.dataset.birtualized = ''
}