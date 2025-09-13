import { splitOnce } from "../lib/splitOnce";
import { ExtHandlerOptions } from "../ts-refs/trans-render/froop/types";

export class ExtHandler implements EventListenerObject {
    #targetRef: WeakRef<EventTarget>;
    #prop: string | undefined;
    constructor(extSrc: EventTarget, target: EventTarget, public key: string, public options: ExtHandlerOptions){
        const {on} = options;
        this.#targetRef = new WeakRef(target);
        extSrc.addEventListener(on, this);
    }

    handleEvent(e: Event){
        
        if(this.#prop === undefined){
            const {key} = this;
            const [,prop] = splitOnce(key, 'inc_');
            this.#prop = prop!;
        }
        const prop = this.#prop;
        const target = this.#targetRef.deref();
        if(target === undefined) return;
        if(!(<any>target)[prop]) {
            (<any>target)[prop] = 1;
        }else{
            (<any>target)[prop]++;
        }
        const stopPropagation = this.options.stopPropagation; 
        if(stopPropagation) e.stopPropagation();
    }
}