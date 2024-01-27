import {MountOrchestrator, Transformer, arr} from '../Transform.js';
import { Derivative, UnitOfWork } from '../types.js';
export async function getDerivedVal<TProps extends {}, TMethods, TElement = Element>(
    transformer: Transformer<TProps, TMethods, TElement>, 
    uow: UnitOfWork<TProps, TMethods, TElement>, 
    d: Derivative<TProps, TMethods, TElement>,
    matchingElement: Element,
){
    switch(typeof d){
        case 'number':{
            return await transformer.getNumberUVal(uow, d);
        }
        case 'function':{
            const {model} = transformer;
            return await d(model, transformer, uow, matchingElement);
        }
        case 'object': {
            if(Array.isArray(d)){
                return await transformer.getArrayVal(uow, d);
                
            }else{
                return await transformer.getComplexDerivedVal(uow, d);
            }
        }
        case 'string': {
            const {model} = transformer;
            return (<any>model[d])(model, transformer, uow, matchingElement);
        }

    }
}