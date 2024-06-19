import {O} from './O.js';
import { PropInfo } from './types';

export class Reflector{
    constructor(instance: O, attrsToReflect: string){
        const {propagator} = instance;
        const attrs = (<any>instance.constructor).attrs as {[key: string] : PropInfo};
        const parsedAttrsToReflect = attrsToReflect.split(' ');
        for(const attr in attrs){
            if(!parsedAttrsToReflect.includes(attr)) continue;
            const propInfo = attrs[attr];
            const {propName} = propInfo;
            propagator.addEventListener(propName!, e => {
                console.log({e});
                this.reflect(instance, attr, propName!, propInfo);
            });
            this.reflect(instance, attr, propName!, propInfo);
        }
    }

    reflect(instance: O, attr: string, propName: string, propInfo: PropInfo){
        console.log({attr, propInfo});
        instance.ignoreAttrChanges = true;
        instance.setAttribute(attr, instance[propName!].toString());
        instance.ignoreAttrChanges = false;
    }
}