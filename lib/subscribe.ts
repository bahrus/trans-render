export type Callback = (element: Element, propName: string, newValue: any) => void;

const propSubscribers = new WeakMap<Element, {[key: string]: Callback[]}>();

export function tooSoon(element: Element){
    return element.localName.includes('-') && customElements.get(element.localName) === undefined;
}

export async function subscribe(element: Element, propName: string, callback: Callback) {
    if(tooSoon(element)){
        await customElements.whenDefined(element.localName);
    }
    if(!propSubscribers.has(element)){
        propSubscribers.set(element, {
        });
    }
    const subscribers = propSubscribers.get(element)!;
    if(subscribers[propName] === undefined){
        subscribers[propName] = [callback];   
        let proto = element;
        let prop: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(proto, propName);
        while(proto && !prop){
            proto = Object.getPrototypeOf(proto);
            prop = Object.getOwnPropertyDescriptor(proto, propName);
        }
        if(prop === undefined){
            throw {element, propName, message: "Can't find property."};
        }
        const setter = prop.set!.bind(element);
        const getter = prop.get!.bind(element);
        Object.defineProperty(element, propName, {
            get(){
                return getter();
            },
            set(nv){
                setter(nv);
                try{
                    const isConnected = element.isConnected;
                }catch{
                    propSubscribers.delete(element);
                    return;
                }
                const callbacks = subscribers[propName];
                if(callbacks){
                    callbacks.forEach(callback => callback(element, propName, nv));
                }
            },
            enumerable: true,
            configurable: true,
        });
    }else{
        subscribers[propName].push(callback);
    }
}

export function unsubscribe(element: Element){
    propSubscribers.delete(element);
}
