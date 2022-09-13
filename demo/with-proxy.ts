
export class MyCustomElement{
    #myPrivateProp = '12345';

    proxy: EventTarget | undefined;

    pb: PropertyBag | undefined;
    constructor(){
        const pb = new PropertyBag();
        this.proxy = new Proxy(pb.proxy, {
            get: (obj: any, prop: string, handler) => 
            {
                switch(prop){
                    case 'p1':
                        return this.#myPrivateProp;
                    default:
                        return (<any>pb.proxy)[prop]
                }
            },
            set: (obj: any, prop: string, val) => {
                switch(prop){
                    case 'p1':
                        this.#myPrivateProp = val;
                        return true;
                    default:
                        (<any>pb.proxy)[prop] = val;
                        return true;
                }
            }
        });
        this.pb = pb;
    }
}

export class PropertyBag extends EventTarget{

    proxy: EventTarget;
    constructor(){
        super();
        const self = this;
        this.proxy = new Proxy(self, {
            get(obj: any, prop){
                //https://stackoverflow.com/questions/59109571/addeventlistener-on-proxied-event-target
                const value = Reflect.get(obj, prop);
                if(typeof(value) == "function"){
                    return value.bind(obj);
                }
                return obj[prop];
            },
            set(obj: any, prop: string, val){
                obj[prop] = val;
                self.dispatchEvent(new Event(prop));
                return true;
            }
        })
    }
}