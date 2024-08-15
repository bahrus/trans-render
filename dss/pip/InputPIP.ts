import { PIP, GetPIPOptions } from "../../ts-refs/trans-render/dss/types";

/**
 * Prop Host
 */
export class InputPH<TValue, HTMLInputElement> implements PIP<TValue, HTMLInputElement>{

    constructor(public options: GetPIPOptions, element: HTMLInputElement){
        
    }
    propagator: EventTarget;
    getValue(el: HTMLInputElement): Promise<TValue | undefined> {
        throw new Error("Method not implemented.");
    }
    setValue(el: HTMLInputElement, val: TValue) {
        throw new Error("Method not implemented.");
    }
    hydrate(el: HTMLInputElement) {
        throw new Error("Method not implemented.");
    }
    syncVal(el: HTMLInputElement) {
        throw new Error("Method not implemented.");
    }
    disconnect() {
        throw new Error("Method not implemented.");
    }
    toString(nv: TValue): string {
        throw new Error("Method not implemented.");
    }
    outEvtName = 'value';
    handleEvent(object: Event): void {
        throw new Error("Method not implemented.");
    }
}