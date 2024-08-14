import {PHI, GetPHOptions} from '../../ts-refs/trans-render/dss/types'
import { RoundaboutReady } from '../../ts-refs/trans-render/froop/types';

/**
 * Round about ready PH
 */
export class RA_PH implements PHI{
    constructor(public options: GetPHOptions, element: RoundaboutReady){
        // move this logic to constructor
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
    getValue(el: Element): Promise<any> {
        return (<any>el)[this.options.prop!];
    }
    setValue(el: Element, val: any) {
        (<any>el)[this.options.prop!];
    }
    hydrate(el: Element) {
        //throw new Error('Method not implemented.');
    }
    syncVal(el: Element) {
        //throw new Error('Method not implemented.');
    }
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