import {O} from './O.js';
import { PropInfo } from '../ts-refs/trans-render/froop/types.js';
import { EventHandler } from '../EventHandler.js';

class AttrReflector extends EventHandler<Reflector>{
    instance: O | undefined;
    attr: string | undefined;
    propName: string | undefined;
    propInfo: PropInfo | undefined;
    override handleEvent(): void {
        const {instance, propName, attr} = this;
        const val = (<any>instance)[propName!];
        if(val === undefined) return;
        instance!.ignoreAttrChanges = true;
        if(val === null || val === false) {
            instance!.removeAttribute(attr!);
        }else{
            instance!.setAttribute(attr!, val.toString());
        }
        
        instance!.ignoreAttrChanges = false;
    }
}
export class Reflector{
    #acs: AbortController[] = [];
    constructor(public instance: O, public attrsToReflect: string){
        const {propagator} = instance;
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
            const attrReflector = new AttrReflector(this);
            Object.assign(attrReflector, {instance, attr, propName, propInfo});
            attrReflector.sub(propagator, propName!, {signal: ac.signal});
            attrReflector.handleEvent();
            // propagator.addEventListener(propName!, e => {
            //     this.#reflect(instance, attr, propName!, propInfo);
            // }, );
            // this.#reflect(instance, attr, propName!, propInfo);
        }
        //I'm thinking this event handler doesn't access any shared memory
        // so no need to use EventHandler
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        }, {once: true});
    }

    #disconnect(){
        for(const ac of this.#acs){
            ac.abort();
        }
    }



    #reflect(instance: O, attr: string, propName: string, propInfo: PropInfo){
        const val = (<any>instance)[propName!];
        if(val === undefined) return;
        instance.ignoreAttrChanges = true;
        if(val === null || val === false) {
            instance.removeAttribute(attr);
        }else{
            instance.setAttribute(attr, val.toString());
        }
        
        instance.ignoreAttrChanges = false;
    }
}