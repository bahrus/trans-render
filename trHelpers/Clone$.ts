import {Clone$Options} from '../ts-refs/trans-render/types.js';
import {IshEvent} from 'mount-observer/Newish.js';
import {getCount} from '../dss/tref/getCount.js'
import 'mount-observer/preloadContent.js';
import 'mount-observer/refid/via.js';
import {lispToCamel} from '../lib/lispToCamel.js';
export const modelSym = Symbol();
const refIDAttr = 'data-trans-render-idrefs';
const refIDProp = lispToCamel(refIDAttr);
export class Clone$ implements EventListenerObject{
    #clone$Options: Clone$Options;
    constructor(options: Clone$Options){
        this.#clone$Options = options;
        this.hydrate();
    }
    async hydrate(){
        const {ishContainer} = this.#clone$Options;
        ishContainer.addEventListener('ish', this);
        this.handleEvent();
    }
    async handleEvent(e?: Event){
        if(e instanceof IshEvent){
            if(!e.actions.includes('ishListAssigned')) return;
        }
        const {
            ish, idxStart, seedEl, itemProp, mapIdxTo,
            itemTemplate, baseCrumb, idleTimeout, 
        } = this.#clone$Options;
        
        const {getIsh} = await import('mount-observer/refid/getIsh.js');
        const ctr = await getIsh(seedEl, itemProp);
        const idRefs: Array<string> = [];
        const {Newish} = await import('mount-observer/Newish.js');
        let idx = idxStart;
        const {waitForIdleNodes} = await import('mount-observer/MountObserver.js');
        const fragment = document.createDocumentFragment();
        const nodesWeWantToWaitFor  = [] as Array<Node>;
        // const existingIshNodes = [] as Array<any>;
        // let ns = seedEl as Element | null;
        // while(ns !== null){
        //     if(ns.getAttribute('itemscope') === itemProp){
        //         existingIshNodes.push(ns);
        //     }
        //     ns = ns.nextElementSibling;
        // }
        
        const existingIshNodes = (<any>seedEl).via[refIDProp].children as Array<Element>;
        let absIdx = 0;
        let isOutOfRange = false;
        let lastExisting = seedEl;
        const {assignGingerly} = await import('../lib/assignGingerly.js');
        const newArr = [];
        for(const item of ish){
            if(!isOutOfRange){
                const existingIshNode = existingIshNodes[absIdx];
                if(existingIshNode !== undefined){
                    idRefs.push(existingIshNode.id);
                    existingIshNode.ish = item;
                    newArr.push(existingIshNode.ish);
                    if(mapIdxTo !== undefined){
                        existingIshNode.ish[mapIdxTo] = idx++;
                    }
                    lastExisting = existingIshNode;
                    absIdx++;
                    continue;
                }else{
                    isOutOfRange = true;
                }
            }
            absIdx++;
            const clone =  ((<any>itemTemplate).remoteContent as DocumentFragment).cloneNode(true) as DocumentFragment;
            (<any>clone).targetFragment = seedEl.getRootNode();
            const children = Array.from(clone.children);
            children.forEach(c => {nodesWeWantToWaitFor.push(c)});
            //TODO:  modify template element so don't have to do this with every loop
            const firstElementChild = clone.firstElementChild as  Element;
            if(firstElementChild === null) throw 404;
            const id = `${baseCrumb}-${getCount(baseCrumb)}`;
            firstElementChild.id = id;
            idRefs.push(id);
            const n = new Newish(firstElementChild, firstElementChild, itemProp, {
                ctr,
                assigner: assignGingerly,
                csr: true,
                initPropVals: item,
            });
            const ce = await n.do();
            newArr.push(ce);
            //TODO: insert into arr
            //firstElementChild.ish = item;
            if(mapIdxTo !== undefined){
                (<any>ce)[mapIdxTo] = idx++;
            }
            
            firstElementChild.setAttribute('itemscope', itemProp);
            if(children.length > 1){
                let itemref = firstElementChild.getAttribute('itemref') || '';
                for(let i = 1, ii = children.length; i < ii; i++){
                    const child = children[i];
                    if(!child.id){
                        child.id = `${baseCrumb}-${getCount(baseCrumb)}`;
                        itemref += ' ' + child.id;
                    }
                }
                firstElementChild.setAttribute('itemref', itemref.trim());
            }
            // await bindish(clone, seedEl, {
            //     assigner: assignGingerly,
            //     csr: true,
            // }); //TODO assign gingerly
            //TODO:  max buffer size
            fragment.appendChild(clone);
        }
        const {listProp} = this.#clone$Options;
        if(listProp !== undefined && ish[modelSym] !== undefined){
            ish[modelSym][listProp] = newArr;
        }
        if(absIdx < existingIshNodes.length){
            const {deleteEl} = await import('trans-render/dss/tref/deleteEl.js');
            for(let i = absIdx; i < existingIshNodes.length; i++){
                const existingIshNode = existingIshNodes[i];
                if(existingIshNode.hasAttribute('itemref')){
                    deleteEl(existingIshNode);
                }else{
                    existingIshNode.remove();
                }
                
            }
        }
        await waitForIdleNodes(nodesWeWantToWaitFor, idleTimeout);
        if(lastExisting.hasAttribute('itemref')){
            const {tail} = await import('../dss/tref/tail.js');
            lastExisting = tail(lastExisting)!;
        }
        lastExisting.after(fragment);
        seedEl.setAttribute(refIDAttr, idRefs.join(' '));
    }
}