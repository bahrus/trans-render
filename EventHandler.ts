//until the platform fixes this issue (sigh):  https://jakearchibald.com/2024/garbage-collection-and-closures/
export class EventHandler<T = any> {
    constructor(public self: T, public method: (instance: T, event: Event, arg?: any) => void, public arg?: any){}
    static new<T>(self: T, method: (instance: T, event: Event, arg?: any) => void, arg?: any){
        return new EventHandler(self, method, arg);
    }
    handleEvent(e: Event){
        if(this.method === undefined) return;
        this.method(this.self, e, this.arg);
    }
    sub(et: EventTarget, type: string, options: AddEventListenerOptions){
        et.addEventListener(type, this, options);
    }
}