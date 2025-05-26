import {HasIsh, HasIshList} from '../ts-refs/trans-render/dss/types';
import {Clone$Options} from '../ts-refs/trans-render/types.js';
import {IshEvent} from 'mount-observer/Newish.js';
export class Clone$ implements EventListenerObject{
    #clone$Options: Clone$Options;
    constructor(options: Clone$Options){
        this.#clone$Options = options;
        this.hydrate();
    }
    async hydrate(){
        const {ish} = this.#clone$Options;
        ish.addEventListener('ish', this);
        this.handleEvent();
    }
    async handleEvent(e?: Event){
        if(e instanceof IshEvent){
            if(!e.actions.includes('ishListAssigned')) return;
        }
        const {
            ish, idxStart, seedEl, itemProp, mapIdxTo,
            itemTemplate, baseCrumb, idleTimeout
        } = this.#clone$Options;
        
        const {getIsh} = await import('mount-observer/refid/getIsh.js');
        const ctr = await getIsh(seedEl, itemProp);
        console.log({itemProp, ctr});
        //const {bindish} = await import('mount-observer/bindish.js');
        const {Newish} = await import('mount-observer/Newish.js');
        let idx = idxStart;
        const {waitForIdleNodes} = await import('mount-observer/MountObserver.js');
        const fragment = document.createDocumentFragment();
        const nodesWeWantToWaitFor  = [] as Array<Node>;
        const existingIshNodes = [] as Array<any>;
        let ns = seedEl as Element | null;
        while(ns !== null){
            if(ns.getAttribute('itemscope') === itemProp){
                existingIshNodes.push(ns);
            }
            ns = ns.nextElementSibling;
        }
        let absIdx = 0;
        let isOutOfRange = false;
        let lastExisting = seedEl;
        const {assignGingerly} = await import('../lib/assignGingerly.js');
        const newArr = [];
        for(const item of ish){
            if(!isOutOfRange){
                const existingIshNode = existingIshNodes[absIdx];
                if(existingIshNode !== undefined){
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
            let templToClone = itemTemplate;
            const externalRefId = templToClone.dataset.blowDryRef;
            if (externalRefId){
                templToClone = window[externalRefId];
            }
            const clone =  itemTemplate.content.cloneNode(true) as DocumentFragment;
            const children = Array.from(clone.children);
            children.forEach(c => {nodesWeWantToWaitFor.push(c)});
            //TODO:  modify template element so don't have to do this with every loop
            const firstElementChild = clone.firstElementChild as HasIsh & Element;
            if(firstElementChild === null) throw 404;
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
                ce[mapIdxTo] = idx++;
            }
            
            firstElementChild.setAttribute('itemscope', itemProp);
            if(children.length > 1){
                let itemref = firstElementChild.getAttribute('itemref') || '';
                for(let i = 1, ii = children.length; i < ii; i++){
                    const child = children[i];
                    if(!child.id){
                        const {getCount} = await import('trans-render/dss/tref/getCount.js');
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
        const {model, listProp} = this.#clone$Options;
        if(model !== undefined && listProp !== undefined){
            model.model[listProp] = newArr;
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
    }
}