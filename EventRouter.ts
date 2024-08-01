//until the platform fixes this issue (sigh):  https://jakearchibald.com/2024/garbage-collection-and-closures/
export class EventRouter<T = any> {
    constructor(public self: T, public method?: (instance: T, event: Event, arg?: any) => void, public arg?: any){}
    handleEvent(e: Event){
        if(this.method === undefined) return;
        this.method(this.self, e, this.arg);
    }
}