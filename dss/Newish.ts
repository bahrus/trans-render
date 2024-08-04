export {waitForEvent} from '../lib/isResolved.js';
export class Newish extends EventTarget{
    queue: Array<any> = [];
    isResolved = false;
    #ce: HTMLElement | undefined;

    constructor(enhancedElement: Element, itemscope: string){
        super();
        this.#do(enhancedElement, itemscope);
    }

    async #do(enhancedElement: Element, itemscope: string){
        //if(Object.hasOwn(enhancedElement, 'host')) return;
        await customElements.whenDefined(itemscope);
        const initPropVals = (<any>enhancedElement)['ish'];
        //check to make sure it didn't already get attached while waiting
        if(initPropVals === undefined ||  customElements.getName(initPropVals.constructor) !== itemscope){
            if(enhancedElement instanceof HTMLElement){
                if(enhancedElement.dataset.hostInitProps){
                    const parsedHostProps = JSON.parse(enhancedElement.dataset.hostInitProps);
                    this.queue.push(parsedHostProps);
                }
            }
            if(initPropVals !== undefined) this.queue.push(initPropVals);
            const ce = document.createElement(itemscope);
            if('attachedCallback' in ce && typeof ce.attachedCallback === 'function'){
                await ce.attachedCallback(enhancedElement)
            }
            this.#ce = ce;
            const self = this;
            Object.defineProperty(enhancedElement, 'ish', {
                get(){
                    return self.#ce;
                },
                set(nv: any){
                    self.queue.push(nv);
                    self.#assignGingerly();
                },
                enumerable: true,
                configurable: true,
            });
        }

        this.isResolved = true;
        this.dispatchEvent(new Event('resolved'));
    }

    async #assignGingerly(){
        let ce = this.#ce!;
        if(ce === undefined){
            throw 500;
        }
        const {assignGingerly} = await import('../lib/assignGingerly.js');
        while(this.queue.length > 0 ){
            const fi = this.queue.shift();
            await assignGingerly(ce, fi);
        }
    }

}
