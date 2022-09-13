export class MyCustomElement {
    #myPrivateProp = '12345';
    proxy;
    constructor() {
        const pb = new PropertyBag();
        this.proxy = new Proxy(pb.proxy, {
            get: (obj, prop, handler) => {
                switch (prop) {
                    case 'p1':
                        return this.#myPrivateProp;
                    default:
                        return pb.proxy[prop];
                }
            },
            set: (obj, prop, val) => {
                switch (prop) {
                    case 'p1':
                        this.#myPrivateProp = val;
                        return true;
                    default:
                        pb.proxy[prop] = val;
                        return true;
                }
            }
        });
    }
}
export class PropertyBag extends EventTarget {
    proxy;
    constructor() {
        super();
        const self = this;
        this.proxy = new Proxy(self, {
            get(obj, prop) {
                //https://stackoverflow.com/questions/59109571/addeventlistener-on-proxied-event-target
                const value = Reflect.get(obj, prop);
                if (typeof (value) == "function") {
                    return value.bind(obj);
                }
                return obj[prop];
            },
            set(obj, prop, val) {
                obj[prop] = val;
                self.dispatchEvent(new Event(prop));
                return true;
            }
        });
    }
}
