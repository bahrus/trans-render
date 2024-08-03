//until the platform fixes this issue (sigh):  https://jakearchibald.com/2024/garbage-collection-and-closures/
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
        if (this.method === undefined)
            return;
        this.method(this.self, e, this.arg);
    }
    sub(et, type, options) {
        et.addEventListener(type, this, options);
    }
}
