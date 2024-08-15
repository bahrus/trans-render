import {PIP, GetPIPOptions} from '../../ts-refs/trans-render/dss/types.js'
import { RoundaboutReady } from '../../ts-refs/trans-render/froop/types.js';
import {BasePIP} from './BasePIP.js';

/**
 * Round about ready PH
 */
export class RA_PH<TValue = any, TElement = Element> extends BasePIP<TValue, TElement>{
    constructor(public options: GetPIPOptions, element: RoundaboutReady){
        super();
        const {prop, evtName} = options;
        if(prop === undefined){
            options.prop = 'value';
        }
        if(evtName === undefined){
            options.evtName = prop;
        }
        this.propagator = element.propagator!;
    }
    propagator: EventTarget;

    hydrate(el: TElement) {
        //throw new Error('Method not implemented.');
    }
    // syncVal(el: Element) {
    //     //throw new Error('Method not implemented.');
    // }
    disconnect() {
        throw new Error('Method not implemented.');
    }
    toString(nv: any): string {
        throw new Error('Method not implemented.');
    }
    outEvtName = this.options.evtName!;
    handleEvent(object: Event): void {
        //throw new Error('Method not implemented.');
    }
}