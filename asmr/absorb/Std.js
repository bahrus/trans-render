export class Std extends EventTarget {
    ao;
    so;
    constructor(targetEl, ao, so) {
        super();
        this.ao = ao;
        this.so = so;
    }
    async getValue(el) {
        return this.so.pureValue;
    }
}
