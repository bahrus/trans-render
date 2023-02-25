
interface PropertySubscriber{
    ref: WeakRef<Element>;
    subscribedProps: Set<string>;
}
export class BePropagating extends EventTarget{

    #innerET: EventTarget | undefined;
    #subscriptions: PropertySubscriber | undefined;
    constructor(target: Element){
        super();
        this.#createOrReuseEventTarget(target);
    }
    async addEventListener(propName: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined) {
        if(this.#innerET === undefined){
            const {waitForEvent} = await import('./isResolved.js');
            await waitForEvent(this, 'resolved');
        }
        
        if(this.#subscriptions !== undefined){
            const {ref, subscribedProps} = this.#subscriptions;
            if(!subscribedProps.has(propName)){
                const target = ref.deref();
                if(!target) return;
                subscribedProps.add(propName);
                let proto = target;
                let prop: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(proto, propName);
                while(proto && !prop){
                    proto = Object.getPrototypeOf(proto);
                    prop = Object.getOwnPropertyDescriptor(proto, propName);
                }
                if(prop === undefined){
                    throw {target, propName, message: "Can't find property."};
                }
                const setter = prop.set!.bind(target);
                const getter = prop.get!.bind(target);
                Object.defineProperty(target, propName, {
                    get(){
                        return getter();
                    },
                    set(nv){
                        setter(nv);
                        this.#innerET.dispatchEvent(new Event(propName));
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }

        this.#innerET!.addEventListener(propName, callback, options);
    }

    async #createOrReuseEventTarget(target: Element){
        const {isDefined} = await import('./isDefined.js');
        await isDefined(target);
        const xtalState = (<any>target).xtalState as EventTarget;
        if(xtalState !== undefined) {
            this.#innerET = xtalState;
        }else{
            this.#subscriptions = {
                ref: new WeakRef(target),
                subscribedProps: new Set(),
            };
            this.#innerET = new EventTarget();
        }
        this.dispatchEvent(new Event('resolved'));
        
        
    }

    
}

