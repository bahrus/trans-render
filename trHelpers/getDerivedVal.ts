import {MountOrchestrator, Transformer, arr} from '../Transform.js';
import { Derivative, UnitOfWork } from '../types.js';
export async function getDerivedVal<TProps, TMethods>(
    transformer: Transformer<TProps, TMethods>, 
    uow: UnitOfWork<TProps, TMethods>, 
    d: Derivative<TProps, TMethods>
){
    switch(typeof d){
        case 'number':{
            return await transformer.getNumberUVal(uow, d);
        }
        case 'function':{
            const {model} = transformer;
            return await d(model);
        }
        case 'object': {
            if(Array.isArray(d)){
                return transformer.getArrayVal(uow, d);
                
            }else{
                throw 'NI';
                // const val = await transformer.getNestedObjVal(uow, d);
                // Object.assign(matchingElement, val);
            }
            break;
        }
        case 'string': {
            const {model} = transformer;
            return (<any>model[d])(model);
        }

    }
}