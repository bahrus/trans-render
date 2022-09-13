export class PropertyBag extends EventTarget{

    static new(){
        const pb = new PropertyBag();
        return pb.proxy;
    }

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
//https://infrequently.org/2021/03/reactive-data-modern-js/
//Name inspired by https://www.tutorialsteacher.com/mvc/viewbag-in-asp.net-mvc https://docs.microsoft.com/en-us/dotnet/api/microsoft.web.management.server.propertybag?view=iis-dotnet
