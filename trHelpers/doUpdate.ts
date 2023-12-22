import {MountOrchestrator, Transformer} from '../Transform.js';
import { Derivative, UnitOfWork } from '../types.js';
export async function doUpdate<TProps, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element, 
    uow: UnitOfWork<TProps, TMethods>
){
    const {d, o, s} = uow;
    if(o === undefined){
        if(s === undefined) throw 'NI';
        Object.assign(matchingElement, s);
        return;
    }
    if(typeof s === 'object') throw 'NI';
    switch(typeof d){
        case 'number':{
            const val = transformer.getNumberUVal(uow, d);
            if(s !== undefined){
                (<any>matchingElement)[s as string] = val;
            }
            transformer.setPrimeValue(matchingElement, val);
            break;
        }
        case 'function':{
            const newU = await d(matchingElement,  uow);
            const newUow = {
                ...uow,
                d: newU,
            }
            if(newU !== undefined){
                await transformer.doUpdate(matchingElement, uow, newU);
            }
            break;
        }
        case 'object': {
            if(Array.isArray(d)){
                const val = transformer.getArrayVal(uow, d);
                transformer.setPrimeValue(matchingElement, val);
            }else{
                const val = await transformer.getNestedObjVal(uow, d);
                Object.assign(matchingElement, val);
            }
        }

    }
}