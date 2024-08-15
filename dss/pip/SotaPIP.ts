import { PIP, GetPIPOptions } from "../../ts-refs/trans-render/dss/types";


/**
 * Prop Host
 */
export class SotaPIP<TValue, Element> implements PIP<TValue, Element>{
    constructor(public options: GetPIPOptions, element: Element){

    }
    propagator: EventTarget;
    getValue(el: Element): Promise<TValue | undefined> {
        return (<any>el)[this.options.prop!];
    }
    setValue(el: Element, val: TValue) {
        throw new Error("Method not implemented.");
    }
    hydrate(el: Element) {
        throw new Error("Method not implemented.");
    }
    syncVal(el: Element) {
        throw new Error("Method not implemented.");
    }
    disconnect() {
        throw new Error("Method not implemented.");
    }
    toString(nv: TValue): string {
        throw new Error("Method not implemented.");
    }
    outEvtName: string;
    handleEvent(object: Event): void {
        throw new Error("Method not implemented.");
    }
    
}