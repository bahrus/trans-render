import { IshEvent } from 'mount-observer/Newish.js';
export const modelSym = Symbol();
export class Clone$ {
    #clone$Options;
    constructor(options) {
        this.#clone$Options = options;
        this.hydrate();
    }
    async hydrate() {
        const { ishContainer } = this.#clone$Options;
        ishContainer.addEventListener('ish', this);
        this.handleEvent();
    }
    async handleEvent(e) {
        if (e instanceof IshEvent) {
            if (!e.actions.includes('ishListAssigned'))
                return;
        }
        const { ish, idxStart, seedEl, itemProp, mapIdxTo, itemTemplate, baseCrumb, idleTimeout, } = this.#clone$Options;
        const { getIsh } = await import('mount-observer/refid/getIsh.js');
        const ctr = await getIsh(seedEl, itemProp);
        //console.log({itemProp, ctr});
        //const {bindish} = await import('mount-observer/bindish.js');
        const { Newish } = await import('mount-observer/Newish.js');
        let idx = idxStart;
        const { waitForIdleNodes } = await import('mount-observer/MountObserver.js');
        const fragment = document.createDocumentFragment();
        const nodesWeWantToWaitFor = [];
        const existingIshNodes = [];
        let ns = seedEl;
        while (ns !== null) {
            if (ns.getAttribute('itemscope') === itemProp) {
                existingIshNodes.push(ns);
            }
            ns = ns.nextElementSibling;
        }
        let absIdx = 0;
        let isOutOfRange = false;
        let lastExisting = seedEl;
        const { assignGingerly } = await import('../lib/assignGingerly.js');
        const newArr = [];
        for (const item of ish) {
            if (!isOutOfRange) {
                const existingIshNode = existingIshNodes[absIdx];
                if (existingIshNode !== undefined) {
                    existingIshNode.ish = item;
                    newArr.push(existingIshNode.ish);
                    if (mapIdxTo !== undefined) {
                        existingIshNode.ish[mapIdxTo] = idx++;
                    }
                    lastExisting = existingIshNode;
                    absIdx++;
                    continue;
                }
                else {
                    isOutOfRange = true;
                }
            }
            absIdx++;
            let templToClone = itemTemplate;
            const externalRefId = templToClone.dataset.blowDryRef;
            if (externalRefId) {
                templToClone = window[externalRefId];
            }
            const clone = itemTemplate.content.cloneNode(true);
            const rn = seedEl.getRootNode();
            clone.targetFragment = rn;
            const children = Array.from(clone.children);
            children.forEach(c => { nodesWeWantToWaitFor.push(c); });
            //TODO:  modify template element so don't have to do this with every loop
            const firstElementChild = clone.firstElementChild;
            if (firstElementChild === null)
                throw 404;
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
            if (mapIdxTo !== undefined) {
                ce[mapIdxTo] = idx++;
            }
            firstElementChild.setAttribute('itemscope', itemProp);
            if (children.length > 1) {
                let itemref = firstElementChild.getAttribute('itemref') || '';
                for (let i = 1, ii = children.length; i < ii; i++) {
                    const child = children[i];
                    if (!child.id) {
                        const { getCount } = await import('trans-render/dss/tref/getCount.js');
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
        const { listProp } = this.#clone$Options;
        if (listProp !== undefined && ish[modelSym] !== undefined) {
            ish[modelSym][listProp] = newArr;
        }
        if (absIdx < existingIshNodes.length) {
            const { deleteEl } = await import('trans-render/dss/tref/deleteEl.js');
            for (let i = absIdx; i < existingIshNodes.length; i++) {
                const existingIshNode = existingIshNodes[i];
                if (existingIshNode.hasAttribute('itemref')) {
                    deleteEl(existingIshNode);
                }
                else {
                    existingIshNode.remove();
                }
            }
        }
        await waitForIdleNodes(nodesWeWantToWaitFor, idleTimeout);
        if (lastExisting.hasAttribute('itemref')) {
            const { tail } = await import('../dss/tref/tail.js');
            lastExisting = tail(lastExisting);
        }
        lastExisting.after(fragment);
    }
}
