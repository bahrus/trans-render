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
            set(obj, prop, newVal) {
                const oldValue = obj[prop];
                obj[prop] = newVal;
                self.dispatchEvent(new Event(prop));
                self.dispatchEvent(new CustomEvent('prop-changed', {
                    detail: {
                        oldValue,
                        newVal,
                        prop
                    }
                }));
                return true;
            }
        });
        this.proxy._isPropagating = true;
    }
}
//https://infrequently.org/2021/03/reactive-data-modern-js/
//Name inspired by https://www.tutorialsteacher.com/mvc/viewbag-in-asp.net-mvc https://docs.microsoft.com/en-us/dotnet/api/microsoft.web.management.server.propertybag?view=iis-dotnet
