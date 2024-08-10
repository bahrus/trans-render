import {childRefsKey, cloneKey} from 'mount-observer/compose.js';


const ttGuid = '0j9qIjjR+UWYLrZ3FskVig'
function getCount(baseID: string){
    const key = Symbol.for(ttGuid + baseID);
    let returnCnt = (<any>window)[key] || 0;
    const nextCnt = returnCnt + 1;
    (<any>window)[key] = nextCnt;
    return returnCnt;
}

/**
 * 
 * @param templToTag @type{HTMLTemplateElement}
 * @param baseID @type{string}
 * Look at composed template from mount observer that has itemscope attribute, and tag
 * all the children that were cloned from the template with the id's and link to them via itemref
 */
export function tagTempl(templToTag: HTMLTemplateElement, baseID: string){
    //for now, assume refs already there
    const childRefs = (<any>templToTag)[childRefsKey] as Array<WeakRef<Element>>;
    const clone = ((<any>templToTag)[cloneKey] || templToTag.content.cloneNode(true)) as DocumentFragment;
    
    let children: Array<Element> | undefined;
    if(childRefs !== undefined){
        children = childRefs.map(ref => ref.deref()).filter(x => x !== undefined);
        
    }else{
        children = Array.from(clone.children);
        //should we add weak refs to template?
    }
    const keys : string[] = [];
    for(const child of children){
        if(!child.id){
            const cnt = getCount(baseID);
            child.id = `${baseID}-${cnt}`;
        }
        keys.push(child.id);
    }

    templToTag.setAttribute('itemref', keys.join(' '));
    if(!templToTag.hasAttribute('itemscope')) templToTag.setAttribute('itemscope', '');
    templToTag.after(clone);
}
