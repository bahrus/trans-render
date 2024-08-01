//until the platform fixes this issue (sigh):  https://jakearchibald.com/2024/garbage-collection-and-closures/
export class EventRouter {
    self;
    method;
    arg;
    constructor(self, method, arg) {
        this.self = self;
        this.method = method;
        this.arg = arg;
    }
    handleEvent(e) {
        this.method(this.self, e, this.arg);
    }
}
