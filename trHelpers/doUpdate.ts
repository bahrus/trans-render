import {MountOrchestrator, Transformer} from '../Transform.js';
import { Derivative, UnitOfWork } from '../types.js';
export async function doUpdate<TProps extends {}, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element, 
    uow: UnitOfWork<TProps, TMethods>,
){
    const {d, o, s, sa, i} = uow;
    if(i !== undefined){
        const valOfIf = await transformer.doIfs(matchingElement, uow, i);
        if(!valOfIf) return;
    }
    // if(o === undefined){
    //     if(s === undefined) throw 'NI';
    //     Object.assign(matchingElement, s);
    //     return;
    // }
    if(typeof s === 'object'){
        Object.assign(matchingElement, s);
        return;
    };
    //let val: any;
    if(d === undefined) throw 'NI';
    const val = await transformer.getDerivedVal(uow, d, matchingElement);

    if(s !== undefined){
        const path = s as string;
        if(path[0] === '.'){
            const {setProp} = await import('../lib/setProp.js');
            setProp(matchingElement, path, val);
        }else{
            // if(typeof val === 'object'  && !Array.isArray(val)){
            //     const keys = Object.keys(val);
            //     if(keys[0] in matchingElement){
            //         Object.assign(matchingElement, val);
            //     }else{
            //         (<any>matchingElement)[s as string] = val;
            //     }
            // }else{
                (<any>matchingElement)[s as string] = val;
            //}
            
        }
        
    }else if(sa !== undefined){
        const {A} = await import('../froop/A.js');
        A({[sa]: val}, matchingElement);
    }else{
        transformer.setPrimeValue(matchingElement, val);
    }
}