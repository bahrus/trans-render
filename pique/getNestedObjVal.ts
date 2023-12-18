import {PiqueProcessor, Transformer, arr} from '../index.js';
import {IfInstructions, ObjectExpression, UpdateInstruction} from '../types';
export async function getNestedObjVal<TProps, TActions = TProps>(
    transformer: Transformer<TProps, TActions>, 
    piqueProcessor: PiqueProcessor<TProps>, 
    u: ObjectExpression<TProps>){
    const returnObj: Partial<TProps> = {};
    for(const key in u){
        const v = u[key as keyof TProps & string] as UpdateInstruction<TProps>;
        switch(typeof v){
            case 'number':{
                const val = transformer.getNumberUVal(piqueProcessor, v);
                (<any>returnObj)[key as keyof TProps & string] = val;
                break;
            }
            case 'function':{
                throw 'NI';
            }
            case 'object': {
                if(Array.isArray(v)){
                    const val = transformer.getArrayVal(piqueProcessor, v);
                    (<any>returnObj)[key as keyof TProps & string] = val;
                }else{
                    const val = transformer.getNestedObjVal(piqueProcessor, v);
                    (<any>returnObj)[key as keyof TProps & string] = val;
                }
            }
            case 'boolean':
            case 'string': {
                (<any>returnObj)[key as keyof TProps & string] = v;
                break;
            }
            
        }
    }
    return returnObj;
}