import {MountOrchestrator, Transformer} from '../Transform.js';
import { Derivative, UnitOfWork } from '../types.js';
export async function doUpdate<TProps, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element, 
    uow: UnitOfWork<TProps, TMethods>
){
    const {d, o, s, sa} = uow;
    if(o === undefined){
        if(s === undefined) throw 'NI';
        Object.assign(matchingElement, s);
        return;
    }
    if(typeof s === 'object') throw 'NI';
    let val: any;
    switch(typeof d){
        case 'number':{
            val = transformer.getNumberUVal(uow, d);
            
            
            break;
        }
        case 'function':{
            throw 'NI';
            // const newU = await d(matchingElement,  uow);
            // const newUow = {
            //     ...uow,
            //     d: newU,
            // }
            // if(newU !== undefined){
            //     await transformer.doUpdate(matchingElement, uow, newU);
            // }
            break;
        }
        case 'object': {
            throw 'NI';
            // if(Array.isArray(d)){
            //     const val = transformer.getArrayVal(uow, d);
            //     if(s !== undefined){
            //         (<any>matchingElement)[s as string] = val;
            //     }else{
            //         transformer.setPrimeValue(matchingElement, val);
            //     }
                
            // }else{
            //     const val = await transformer.getNestedObjVal(uow, d);
            //     Object.assign(matchingElement, val);
            // }
        }
        case 'string': {
            const {model} = transformer;
            val = (<any>model[d])(model);
        }

    }
    if(s !== undefined){
        (<any>matchingElement)[s as string] = val;
    }else if(sa !== undefined){
        const {A} = await import('../froop/A.js');
        A({[sa]: val}, matchingElement);
    }else{
        transformer.setPrimeValue(matchingElement, val);
    }
}