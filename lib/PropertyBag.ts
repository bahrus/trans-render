import { ProxyPropChangeInfo } from "./types";

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
                
                const value = Reflect.get(obj, prop);
                const type = typeof value;
                //https://infrequently.org/2021/03/reactive-data-modern-js/
                //https://stackoverflow.com/questions/59109571/addeventlistener-on-proxied-event-target
                // Avoid `this` confusion for functions
                if ((type === "function") &&
                    (prop in EventTarget.prototype)) {
                    return value.bind(obj);
                }
                return value;
            },
            set(obj: any, prop: string, newVal: any){
                const oldVal = obj[prop];
                obj[prop] = newVal;
                const detail = {
                    oldVal,
                    newVal,
                    prop
                } as ProxyPropChangeInfo;
                self.dispatchEvent(new CustomEvent(prop, {
                    detail
                }));
                self.dispatchEvent(new CustomEvent('prop-changed', {
                    detail
                }));
                return true;
            }
        });
        (<any>this.proxy)._isPropagating = true;
    }
}
//https://infrequently.org/2021/03/reactive-data-modern-js/
//Name inspired by https://www.tutorialsteacher.com/mvc/viewbag-in-asp.net-mvc https://docs.microsoft.com/en-us/dotnet/api/microsoft.web.management.server.propertybag?view=iis-dotnet
