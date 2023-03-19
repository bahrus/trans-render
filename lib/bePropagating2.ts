
interface PropertySubscriber{
    ref: WeakRef<any>;
    subscribedProps: Set<string>;
}
export class BePropagating extends EventTarget{

    _innerET: EventTarget | undefined;
    #subscriptions: PropertySubscriber | undefined;
    constructor(target: any){
        super();
        this.#createOrReuseEventTarget(target);
    }
    async addEventListener(propName: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined) {
        if(propName === 'super.resolved') {
            super.addEventListener(propName, callback, options);
            return;
        };
        if(this._innerET === undefined){
            const {waitForEvent} = await import('./isResolved.js');
            if(this._innerET === undefined){
                await waitForEvent(this, 'super.resolved');
            }
            
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
                const self = this;// as BePropagating;
                Object.defineProperty(target, propName, {
                    get(){
                        return getter();
                    },
                    set(nv){
                        setter(nv);
                        self._innerET!.dispatchEvent(new Event(propName));
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }

        this._innerET!.addEventListener(propName, callback, options);
    }

    async #createOrReuseEventTarget(target: any){
        const {isDefined} = await import('./isDefined.js');
        await isDefined(target);
        const xtalState = (<any>target).xtalState as EventTarget;
        if(xtalState !== undefined) {
            this._innerET = xtalState;
        }else{
            this.#subscriptions = {
                ref: new WeakRef(target),
                subscribedProps: new Set(),
            };
            this._innerET = new EventTarget();
        }
        this.dispatchEvent(new CustomEvent('super.resolved', {}));
        
        
    }

    
}

