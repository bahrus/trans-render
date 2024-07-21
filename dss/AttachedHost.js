export { waitForEvent } from '../lib/isResolved.js';
export class AttachedHost extends EventTarget {
    queue = [];
    isResolved = false;
    #ce;
    constructor(enhancedElement) {
        super();
        this.#do(enhancedElement);
    }
    async #do(enhancedElement) {
        if (Object.hasOwn(enhancedElement, 'host'))
            return;
        const itemCE = enhancedElement.getAttribute('itemscope');
        const initPropVals = enhancedElement['host'];
        if (enhancedElement instanceof HTMLElement) {
            if (enhancedElement.dataset.hostInitProps) {
                const parsedHostProps = JSON.parse(enhancedElement.dataset.hostInitProps);
                this.queue.push(parsedHostProps);
            }
        }
        if (initPropVals !== undefined)
            this.queue.push(initPropVals);
        let ref;
        const ce = await this.#doSearch(enhancedElement, itemCE);
        ref = new WeakRef(enhancedElement);
        if (ce !== null) {
            if (Object.hasOwn(ce, 'ownerElement') && ce.ownerElement === undefined) {
                ce.ownerElement = ref;
            }
            this.#ce = new WeakRef(ce);
        }
        const self = this;
        Object.defineProperty(enhancedElement, 'host', {
            get() {
                return self.#ce?.deref();
            },
            set(nv) {
                self.queue.push(nv);
                self.#assignGingerly(this, itemCE);
            },
            enumerable: true,
            configurable: true,
        });
        this.isResolved = true;
        this.dispatchEvent(new Event('resolved'));
    }
    async #assignGingerly(enhancedElement, itemCE) {
        let ce = this.#ce?.deref();
        if (ce === undefined) {
            ce = await this.#doSearch(enhancedElement, itemCE);
            if (ce)
                this.#ce = new WeakRef(ce);
        }
        if (!ce)
            return;
        const { assignGingerly } = await import('../lib/assignGingerly.js');
        while (this.queue.length > 0) {
            const fi = this.queue.shift();
            await assignGingerly(ce, fi);
        }
    }
    async #doSearch(enhancedElement, itemCE) {
        if (enhancedElement instanceof HTMLTemplateElement) {
            const { PseudoCE } = await import('./PseudoCE.js');
            return await PseudoCE(enhancedElement, itemCE);
        }
        return enhancedElement.querySelector(itemCE);
    }
}
