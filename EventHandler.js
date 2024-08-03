//until the platform fixes this issue (sigh):  https://jakearchibald.com/2024/garbage-collection-and-closures/
//This seems to be helpful if the event handler needs to call private methods
//https://stackoverflow.com/questions/17638305/why-is-bind-slower-than-a-closure
export class EventHandler {
    self;
    method;
    arg;
    constructor(self, method, arg) {
        this.self = self;
        this.method = method;
        this.arg = arg;
    }
    static new(self, method, arg) {
        return new EventHandler(self, method, arg);
    }
    handleEvent(e) {
        this.method(this.self, e, this.arg);
    }
    sub(et, type, options) {
        et.addEventListener(type, this, options);
    }
}
