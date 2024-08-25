const props = ['propagator', 'covertAssignment', 'observeProp'];
const publicPrivateStore = Symbol();
const propLookup = Symbol();
export function beRR(obj: any){
    for(const prop of props){
        if(prop in obj) return false;
    }
    obj[publicPrivateStore] = {};
    obj[propLookup] = {};

    obj[props[0]] = new EventTarget();

    obj[props[2]] = (propName: string) => {
        if(obj[propLookup][propName]) return;
        //here we go, yet again
        let proto = obj;
        let propDescriptor = Object.getOwnPropertyDescriptor(proto, propName);
        while (proto && !propDescriptor) {
            proto = Object.getPrototypeOf(proto);
            if (proto === null)
                throw { obj, propName, "msg": 'prop not found.' };
            propDescriptor = Object.getOwnPropertyDescriptor(proto, propName);
        }
        if (propDescriptor === undefined) {
            throw { obj, propName, message: "Can't find property." };
        }
        const setter = propDescriptor.set?.bind(obj);
        const getter = propDescriptor.get?.bind(obj);
        if(getter === undefined){
            obj[publicPrivateStore][propName] = obj[propName];
        }
        //const self = this; // as BePropagating;
        Object.defineProperty(obj, propName, {
            get() {
                return getter ? getter() : obj[publicPrivateStore][propName];
            },
            set(newVal) {
                const oldVal = obj[propName];
                this[publicPrivateStore][propName] = newVal;
                if(setter !== undefined){
                    setter(newVal);
                }
                this[props[0]].dispatchEvent(new Event(propName));
            },
            enumerable: true,
            configurable: true,
        });

    }

    return true;
}