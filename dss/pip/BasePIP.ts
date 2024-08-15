import { PIP, GetPIPOptions } from "../../ts-refs/trans-render/dss/types";

export abstract class BasePIP<TValue, Element> implements PIP<TValue, Element>{
    abstract options: GetPIPOptions;
    abstract propagator: EventTarget;
    getValue(el: Element): Promise<TValue | undefined> {
        return (<any>el)[this.options.prop!]
    }
    setValue(el: Element, val: TValue) {
        (<any>el)[this.options.prop!] = val;
    }
    abstract hydrate(el: Element);

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
    abstract handleEvent(object: Event);
}