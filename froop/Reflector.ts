import {O} from './O.js';
import { PropInfo } from './types';

export class Reflector{
    #acs: AbortController[];
    constructor(instance: O, attrsToReflect: string){
        const {propagator} = instance;
        this.#acs = [];
        const attrs = (<any>instance.constructor).attrs as {[key: string] : PropInfo};
        const parsedAttrsToReflect = attrsToReflect.split(' ');
        for(const attr in attrs){
            if(!parsedAttrsToReflect.includes(attr)) continue;
            const ac: AbortController = new AbortController();
            this.#acs.push(ac);
            const propInfo = attrs[attr];
            const {propName} = propInfo;
            propagator.addEventListener(propName!, e => {
                console.log({e});
                this.reflect(instance, attr, propName!, propInfo);
            }, {signal: ac.signal});
            this.reflect(instance, attr, propName!, propInfo);
        }
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        })
    }

    #disconnect(){
        for(const ac of this.#acs){
            ac.abort();
        }
    }

    reflect(instance: O, attr: string, propName: string, propInfo: PropInfo){
        console.log({attr, propInfo});
        instance.ignoreAttrChanges = true;
        instance.setAttribute(attr, instance[propName!].toString());
        instance.ignoreAttrChanges = false;
    }
}