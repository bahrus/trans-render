import { IshEvent } from 'mount-observer/Newish.js';
import { getCount } from '../dss/tref/getCount.js';
import 'mount-observer/preloadContent.js';
import 'mount-observer/refid/via.js';
import { lispToCamel } from '../lib/lispToCamel.js';
export const modelSym = Symbol();
const refIDAttrBase = 'data-trans-render-idrefs-a';
//const refIDProp = lispToCamel(refIDAttrBase);
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
        const { ish, idxStart, seedEl, itemScopes, mapIdxTo, itemTemplates, baseCrumb, idleTimeout, } = this.#clone$Options;
        const templLen = itemTemplates.length;
        if (templLen !== itemScopes.length)
            throw 'NA';
        const ctrLookup = {};
        const { getIsh } = await import('mount-observer/refid/getIsh.js');
        const { Newish } = await import('mount-observer/Newish.js');
        const { assignGingerly } = await import('../lib/assignGingerly.js');
        const { waitForIdleNodes } = await import('mount-observer/MountObserver.js');
        for (const itemScope of itemScopes) {
            if (!ctrLookup[itemScope]) {
                const ctr = await getIsh(seedEl, itemScope);
                ctrLookup[itemScope] = ctr;
            }
        }
        const idRefs = new Array(templLen).fill([]);
        let idx = idxStart;
        const fragment = document.createDocumentFragment();
        const nodesWeWantToWaitFor = [];
        // const existingIshNodes = [] as Array<any>;
        // let ns = seedEl as Element | null;
        // while(ns !== null){
        //     if(ns.getAttribute('itemscope') === itemProp){
        //         existingIshNodes.push(ns);
        //     }
        //     ns = ns.nextElementSibling;
        // }
        const existingIshNodes = [];
        for (let i = 0; i < templLen; i++) {
            const refIDProp = lispToCamel(`${refIDAttrBase}${i}`);
            existingIshNodes[i] = seedEl.via[refIDProp].children;
        }
        const absIdx = new Array(templLen).fill(0);
        let isOutOfRange = new Array(templLen).fill(false);
        let lastExisting = seedEl;
        const targetFragment = seedEl.getRootNode();
        //const newArr = [];
        for (const item of ish) {
            const skipNewCreation = new Array(templLen).fill(false);
            for (let i = 0; i < templLen; i++) {
                if (!isOutOfRange[i]) {
                    const existingIshNode = existingIshNodes[i][absIdx[i]];
                    if (existingIshNode !== undefined) {
                        idRefs[i].push(existingIshNode.id);
                        existingIshNode.ish = item;
                        //newArr.push(existingIshNode.ish);
                        if (mapIdxTo !== undefined) {
                            existingIshNode.ish[mapIdxTo] = idx++;
                        }
                        lastExisting = existingIshNode;
                        absIdx[i]++;
                        skipNewCreation[i] = true;
                    }
                    else {
                        isOutOfRange[i] = true;
                    }
                }
            }
            // for(let i = 0; i < templLen; i++){
            //     absIdx[i]++;
            // }
            //Create new nodes when necessary
            for (let i = 0; i < templLen; i++) {
                if (skipNewCreation[i])
                    continue;
                if (Array.isArray(item) && !item[i])
                    continue;
                const ithItem = Array.isArray(item) ? item[i] : item;
                const clone = itemTemplates[i].remoteContent.cloneNode(true);
                clone.targetFragment = targetFragment;
                const children = Array.from(clone.children);
                children.forEach(c => { nodesWeWantToWaitFor.push(c); });
                //TODO:  modify template element so don't have to do this with every loop
                const firstElementChild = clone.firstElementChild;
                if (firstElementChild === null)
                    throw 404;
                const id = `${baseCrumb}-${getCount(baseCrumb)}`;
                firstElementChild.id = id;
                idRefs[i].push(id);
                const itemScope = itemScopes[i];
                const ctr = ctrLookup[itemScope];
                const n = new Newish(firstElementChild, firstElementChild, itemScope, {
                    ctr,
                    assigner: assignGingerly,
                    csr: true,
                    initPropVals: item,
                });
                const ce = await n.do();
                //newArr.push(ce);
                //TODO: insert into arr
                //firstElementChild.ish = item;
                if (mapIdxTo !== undefined) {
                    ce[mapIdxTo] = idx++;
                }
                firstElementChild.setAttribute('itemscope', itemScope);
                if (children.length > 1) {
                    let itemref = firstElementChild.getAttribute('itemref') || '';
                    for (let i = 1, ii = children.length; i < ii; i++) {
                        const child = children[i];
                        if (!child.id) {
                            child.id = `${baseCrumb}-${getCount(baseCrumb)}`;
                            itemref += ' ' + child.id;
                        }
                    }
                    firstElementChild.setAttribute('itemref', itemref.trim());
                }
                //TODO:  max buffer size
                fragment.appendChild(clone);
            }
        }
        //const {listScope} = this.#clone$Options;
        // if(listProp !== undefined && ish[modelSym] !== undefined){
        //     ish[modelSym][listProp] = newArr;
        // }
        for (let i = 0; i < templLen; i++) {
            if (absIdx[i] <= existingIshNodes[i].length) {
                const { deleteEl } = await import('trans-render/dss/tref/deleteEl.js');
                for (let j = absIdx[i]; j < existingIshNodes[i].length; j++) {
                    const existingIshNode = existingIshNodes[i][j];
                    if (existingIshNode.hasAttribute('itemref')) {
                        deleteEl(existingIshNode);
                    }
                    else {
                        existingIshNode.remove();
                    }
                }
            }
        }
        await waitForIdleNodes(nodesWeWantToWaitFor, idleTimeout);
        if (lastExisting.hasAttribute('itemref')) {
            //TODO:  use children?
            const { tail } = await import('../dss/tref/tail.js');
            lastExisting = tail(lastExisting);
        }
        lastExisting.after(fragment);
        for (let i = 0; i < templLen; i++) {
            seedEl.setAttribute(`${refIDAttrBase}${i}`, idRefs[i].join(' '));
        }
    }
}
