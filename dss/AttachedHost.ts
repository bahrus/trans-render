export class AttachedHost extends EventTarget{
    queue: Array<any> = [];
    #ce: WeakRef<HTMLElement> | undefined;
    constructor(enhancedElement: Element){
        super();
        this.#do(enhancedElement);
    }

    async #do(enhancedElement: Element){
        if(Object.hasOwn(enhancedElement, 'host')) return;
        const itemCE = enhancedElement.getAttribute('itemscope')!;
        const initPropVals = (<any>enhancedElement)['host'];
        if(enhancedElement instanceof HTMLElement){
            if(enhancedElement.dataset.hostInitProps){
                const parsedHostProps = JSON.parse(enhancedElement.dataset.hostInitProps);
                this.queue.push(parsedHostProps);
            }
        }
        if(initPropVals !== undefined) this.queue.push(initPropVals);
        let ref: WeakRef<Element> | undefined;
        const ce = await this.#doSearch(enhancedElement, itemCE);
        ref = new WeakRef(enhancedElement);
        if(ce !== null){
            if(Object.hasOwn(ce, 'ownerElement') && (<any>ce).ownerElement === undefined){
                (<any>ce).ownerElement = ref;
            }
            this.#ce = new WeakRef(ce);
        }
        const self = this;
        Object.defineProperty(enhancedElement, 'host', {
            get(){
                return self.#ce?.deref();
            },
            set(nv: any){
                self.queue.push(nv);
                self.#assignGingerly(this, itemCE);
            },
            enumerable: true,
            configurable: true,
        });
        this.dispatchEvent(new Event('resolved'));
    }

    async #assignGingerly(enhancedElement: Element, itemCE: string){
        let ce = this.#ce?.deref() as HTMLElement | undefined | null;
        if(ce === undefined){
            ce = await this.#doSearch(enhancedElement, itemCE);
            if(ce) this.#ce = new WeakRef(ce);
        }
        if(!ce) return;
        const {assignGingerly} = await import('../lib/assignGingerly.js');
        while(this.queue.length > 0 ){
            const fi = this.queue.shift();
            await assignGingerly(ce, fi);
        }
    }

    async #doSearch(enhancedElement: Element, itemCE: string){
        if(enhancedElement instanceof HTMLTemplateElement){
            const {PseudoCE} = await import('./PseudoCE.js');
            return await PseudoCE(enhancedElement, itemCE);
        }
        return enhancedElement.querySelector(itemCE) as HTMLElement | null;
    }
}
