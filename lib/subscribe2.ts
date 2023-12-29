export async function subscribe(target: any, props: string | string[], propagator: EventTarget, autoCreateProp = false){
    if(target instanceof Element){
        const {isDefined} = await import('./isDefined.js');
        await isDefined(target);
    }
    if(!Array.isArray(props)) props = [props];
    for(const propName of props){
        let proto = target;
        let prop: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(proto, propName);
        while(proto && !prop){
            proto = Object.getPrototypeOf(proto);
            prop = Object.getOwnPropertyDescriptor(proto, propName);
        }
        if(prop === undefined){
            if(autoCreateProp && propName in target){
                const currentVal = target[propName];
                Object.defineProperty(target, propName, {
                    get(){
                        return target['__' + propName + '_'];
                    },
                    set(nv){
                        target['__' + propName + '_'] = nv;
                        propagator.dispatchEvent(new Event(propName));
                    },
                    enumerable: true,
                    configurable: true,
                });
                target['__' + propName + '_'] = currentVal;
                (<any>propagator)['___props'] = ((<any>propagator)['___props'] || new Set<string>()).add(propName);
                continue;
            }else{
                throw {target, propName, message: "Can't find property."};
            }
            
        }
        const setter = prop.set!.bind(target);
        const getter = prop.get!.bind(target);
        Object.defineProperty(target, propName, {
            get(){
                return getter();
            },
            set(nv){
                setter(nv);
                propagator.dispatchEvent(new Event(propName));
            },
            enumerable: true,
            configurable: true,
        });
    }
    
}