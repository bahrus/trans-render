import {MountOrchestrator, Transformer} from '../index.js';
import { Derivative } from '../types';
export async function doUpdate<TProps, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element, 
    piqueProcessor: MountOrchestrator<TProps, TMethods>, 
    u: Derivative<TProps>
){
    switch(typeof u){
        case 'number':{
            const val = transformer.getNumberUVal(piqueProcessor, u);
            transformer.setPrimeValue(matchingElement, val);
            break;
        }
        case 'function':{
            const newU = await u(matchingElement, piqueProcessor);
            if(newU !== undefined){
                await transformer.doUpdate(matchingElement, piqueProcessor, newU);
            }
            break;
        }
        case 'object': {
            if(Array.isArray(u)){
                const val = transformer.getArrayVal(piqueProcessor, u);
                transformer.setPrimeValue(matchingElement, val);
            }else{
                const val = await transformer.getNestedObjVal(piqueProcessor, u);
                Object.assign(matchingElement, val);
            }
        }

    }
}