import {insertAdjacentClone} from './insertAdjacentClone.js';
/**
 * "Expand" HTMLTemplateElement by replacing special tags with referenced templates
 * @param templ 
 * @param templLookup 
 */
export function birtualize(templ: HTMLTemplateElement, templRefs: {[key: string]: HTMLTemplateElement}, templLookup: (key: string) => HTMLTemplateElement | undefined){
    if(templ.dataset.birtualized) return;
    const {content} = templ;
    const bis = content.querySelectorAll('b-i');
    for(const bi of bis){
        const href = bi.getAttribute('href')?.replace('#', '');
        if(!href) continue;
        const shadowrootmode = bi.getAttribute('shadowrootmode');
        let referencedTempl: HTMLTemplateElement | undefined = templRefs[href];
        if(referencedTempl === undefined){
            referencedTempl = templLookup(href);
            if(referencedTempl === undefined) continue;
            templRefs[href] = referencedTempl;
        }
        
        
        //await birtualize(referencedTempl!, templRefs, templLookup);
        const clone = document.importNode(referencedTempl!.content, true);
        if(shadowrootmode !== null){

        }else{
            const slots = bi.querySelectorAll(`[slot-bot]`);

            for(const slot of slots){
                const name = slot.getAttribute('slot-bot')!;
                const target = clone.querySelector(`slot-bot[name="${name}"]`);
                if(target !== null){
                    target.appendChild(slot);
                }else{
                    slot.remove();
                }
            }
        }

        // should this go higher, where it is commented out?
        birtualize(referencedTempl!, templRefs, templLookup);
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
        if(shadowrootmode !== null){
            if(bi.shadowRoot === null){
                bi.attachShadow({mode: shadowrootmode as ShadowRootMode});
                const rootNode = bi.shadowRoot!;
                rootNode.appendChild(clone);
            }
        }else{
            bi.insertAdjacentElement('afterend', hintTempl);
            if(parentElement !== null && !hasSibling){
                parentElement.append(clone);
            }else{
                //const {insertAdjacentClone} = await import('./insertAdjacentClone.js');
                insertAdjacentClone(clone, hintTempl, 'afterend');
            }
            bi.remove();
        }
        

    };
    templ.dataset.birtualized = ''
}