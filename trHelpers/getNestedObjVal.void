import {MountOrchestrator, Transformer, arr} from '../Transform.js';
import {IfInstructions, ObjectExpression, Derivative, UnitOfWork} from '../types.js';
export async function getNestedObjVal<TProps extends {}, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>, 
    uow: UnitOfWork<TProps, TMethods>, 
    u: ObjectExpression<TProps, TMethods>){
    const returnObj: Partial<TProps> = {};
    for(const key in u){
        const v = u[key as keyof TProps & string] as Derivative<TProps, TMethods>;
        switch(typeof v){
            case 'number':{
                const val = transformer.getNumberUVal(uow, v);
                (<any>returnObj)[key as keyof TProps & string] = val;
                break;
            }
            case 'function':{
                throw 'NI';
            }
            case 'object': {
                if(Array.isArray(v)){
                    const val = transformer.getArrayVal(uow, v);
                    (<any>returnObj)[key as keyof TProps & string] = val;
                }else{
                    const val = transformer.getNestedObjVal(uow, v);
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