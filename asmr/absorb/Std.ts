import { AbsorbingObject } from '../../ts-refs/trans-render/asmr/types';
export class Std<TProp=any> extends EventTarget implements AbsorbingObject{
    getValue(el: Element): Promise<any> {
        throw new Error('Method not implemented.');
    }
    
}