export class MyCustomElement {
    #myPrivateProp = '12345';
    propertyBag;
    constructor() {
        //const pb = new PropertyBag();
        this.propertyBag = PropertyBag.new();
        // this.proxy = new Proxy(pb.proxy, {
        //     get: (obj: any, prop: string, handler) => 
        //     {
        //         switch(prop){
        //             case 'p1':
        //                 return this.#myPrivateProp;
        //             default:
        //                 return (<any>pb.proxy)[prop]
        //         }
        //     },
        //     set: (obj: any, prop: string, val) => {
        //         switch(prop){
        //             case 'p1':
        //                 this.#myPrivateProp = val;
        //                 return true;
        //             default:
        //                 (<any>pb.proxy)[prop] = val;
        //                 return true;
        //         }
        //     }
        // });
    }
}
export class PropertyBag extends EventTarget {
    static new() {
        const pb = new PropertyBag();
        return pb.proxy;
    }
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
