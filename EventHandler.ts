//until the platform fixes this issue (sigh):  https://jakearchibald.com/2024/garbage-collection-and-closures/
//This seems to be helpful if the event handler needs to call private methods
//https://stackoverflow.com/questions/17638305/why-is-bind-slower-than-a-closure
export class EventHandler<T = any> {
    constructor(public self: T, public method: (instance: T, event: Event, arg?: any) => void, public arg?: any){}
    static new<T>(self: T, method: (instance: T, event: Event, arg?: any) => void, arg?: any){
        return new EventHandler(self, method, arg);
    }
    handleEvent(e: Event){
        this.method(this.self, e, this.arg);
    }
    sub(et: EventTarget, type: string, options: AddEventListenerOptions){
        et.addEventListener(type, this, options);
    }
}