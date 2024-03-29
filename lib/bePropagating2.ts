import {ProxyPropChangeInfo} from './types';
interface PropertySubscriber{
    ref: WeakRef<any>;
    subscribedProps: Set<string>;
}
export class BePropagating extends EventTarget{

    _innerET: EventTarget | undefined;
    targetRef: WeakRef<any>;
    #subscriptions: PropertySubscriber | undefined;
    constructor(target: any){
        super();
        this.#createOrReuseEventTarget(target);
        this.targetRef = new WeakRef(target);
    }
    async addEventListener(prop: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined) {
        if(prop === 'super.resolved') {
            super.addEventListener(prop, callback, options);
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
            if(!subscribedProps.has(prop)){
                const target = ref.deref();
                if(!target) return;
                subscribedProps.add(prop);
                let proto = target;
                let propDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(proto, prop);
                while(proto && !propDescriptor){
                    proto = Object.getPrototypeOf(proto);
                    if(proto === null) throw {target, prop, "msg": 'prop not found.'}
                    propDescriptor = Object.getOwnPropertyDescriptor(proto, prop);
                }
                if(propDescriptor === undefined){
                    throw {target, prop, message: "Can't find property."};
                }
                const setter = propDescriptor.set!.bind(target);
                const getter = propDescriptor.get!.bind(target);
                const self = this;// as BePropagating;
                Object.defineProperty(target, prop, {
                    get(){
                        return getter();
                    },
                    set(newVal: any){
                        const oldVal = target[prop];
                        setter(newVal);
                        self._innerET!.dispatchEvent(new CustomEvent(prop, {
                            detail: {
                                prop,
                                newVal,
                                oldVal
                            } as ProxyPropChangeInfo
                        }));
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }

        this._innerET!.addEventListener(prop, callback, options);
    }

    async #createOrReuseEventTarget(target: any){
        if(target instanceof HTMLElement){
            const {isDefined} = await import('./isDefined.js');
            await isDefined(target);
        }
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

