import { AbsOptions, AbsorbingObject } from '../../ts-refs/trans-render/asmr/types';
export class Std<TProp=any> extends EventTarget implements AbsorbingObject{
    constructor(targetEl: Element, public ao: AbsOptions){
        super();
        
    }
    async getValue(el: Element) {
        throw new Error('Method not implemented.');
    }
    
}