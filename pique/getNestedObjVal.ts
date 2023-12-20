import {PiqueProcessor, Transformer, arr} from '../index.js';
import {IfInstructions, ObjectExpression, UpdateInstruction, 
    DependencyTracker,
} from '../types';

const dependencyLookup: Map<ObjectExpression<any>, DependencyTracker> = new Map();
export async function getNestedObjVal<TProps, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>, 
    piqueProcessor: PiqueProcessor<TProps, TMethods>, 
    u: ObjectExpression<TProps>,
    propName?: string){
    let dependencyTracker: DependencyTracker | undefined;
    if(!dependencyLookup.has(u)){
        console.log('new u');
        dependencyTracker = new Map();
        dependencyLookup.set(u, dependencyTracker);
    }else{
        const dep = dependencyLookup.get(u);
        console.log({dep, propName});
    }
    const returnObj: Partial<TProps> = {};
    for(const key in u){
        const v = u[key as keyof TProps & string] as UpdateInstruction<TProps>;
        let vSet: Set<string> | undefined;
        if(dependencyTracker !== undefined){
            vSet = new Set();
            dependencyTracker.set(key, vSet);
        }
        switch(typeof v){

            case 'number':{
                const val = transformer.getNumberUVal(piqueProcessor, v, vSet);
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