export class Std extends EventTarget {
    ao;
    constructor(targetEl, ao) {
        super();
        this.ao = ao;
    }
    async getValue(el) {
        throw new Error('Method not implemented.');
    }
}
