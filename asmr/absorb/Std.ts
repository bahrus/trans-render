import { AbsOptions, AbsorbingObject, SharingObject } from '../../ts-refs/trans-render/asmr/types';
import { StMr } from '../StMr.js';

export class Std<TProp=any> extends EventTarget implements AbsorbingObject{
    constructor(targetEl: Element, public ao: AbsOptions, public so: SharingObject){
        super();

    }
    async getValue(el: Element) {
        return this.so.pureValue;
    }

    
    
}