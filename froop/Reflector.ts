import {O} from './O.js';
import { PropInfo } from '../ts-refs/trans-render/froop/types.js';

class AttrReflector implements EventListenerObject {
    constructor(
        public instance: O,
        public attr: string,
        public propName: string,
    ){}

    handleEvent(): void {
        const {instance, propName, attr} = this;
        const val = (<any>instance)[propName];
        if(val === undefined) return;
        instance!.ignoreAttrChanges = true;
        if(val === null || val === false) {
            instance!.removeAttribute(attr);
        }else{
            instance!.setAttribute(attr, val.toString());
        }
        
        instance!.ignoreAttrChanges = false;
    }
}
export class Reflector{
    #acs: AbortController[] = [];
    constructor(public instance: O, public attrsToReflect: string){
        const {propagator, disconnectedSignal} = instance;
        const attrs = (<any>instance.constructor).attrs as {[key: string] : PropInfo};
        const reflectAll = attrsToReflect === '*';
        let parsedAttrsToReflect: string[] | undefined;
        if(!reflectAll){
            parsedAttrsToReflect = attrsToReflect.split(',').map(s => s.trim());
        }
        for(const attr in attrs){
            if(!reflectAll && !parsedAttrsToReflect!.includes(attr)) continue;
            const ac: AbortController = new AbortController();
            this.#acs.push(ac);
            const propInfo = attrs[attr];
            const {propName} = propInfo;
            const attrReflector = new AttrReflector(instance, attr, propName!);
            propagator.addEventListener(propName!, attrReflector, {signal: ac.signal});
            attrReflector.handleEvent();
        }
        //I'm thinking this event handler doesn't access any shared memory
        // so no need to use EventHandler
        disconnectedSignal.addEventListener('abort', e => {
            this.#disconnect();
        }, {once: true});
    }

    #disconnect(){
        for(const ac of this.#acs){
            ac.abort();
        }
    }



}