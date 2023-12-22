import {MountOrchestrator, Transformer, arr} from '../Transform.js';
import {IfInstructions, UnitOfWork} from '../types.js';
export async function doIfs<TProps, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>, 
    matchingElement: Element, 
    uow: UnitOfWork<TProps, TMethods>, 
    i: IfInstructions<TProps>
){
    const iffs = arr(i);
    for(const iff of iffs){
        const {ifAllOf, ifEqual, ifNoneOf, u} = iff;
        if(ifAllOf !== undefined){
            for(const n of ifAllOf){
                if(!transformer.getNumberUVal(uow, n)) continue;
            }
        }
        if(ifNoneOf !== undefined){
            for(const n of ifNoneOf){
                if(transformer.getNumberUVal(uow, n)) continue;
            }
        }
        if(ifEqual !== undefined){
            const [lhsN, rhsNorS] = ifEqual;
            const lhs = transformer.getNumberUVal(uow, lhsN);
            let rhs;
            switch(typeof rhsNorS){
                case 'number':
                    rhs = transformer.getNumberUVal(uow, rhsNorS);
                    break;
                case 'object':
                    if(Array.isArray(rhsNorS)){
                        [rhs] = rhsNorS;
                    }else{
                        throw 'NI';
                    }
                    break;
                case 'string':
                    rhs = rhsNorS;
                    break;
            }
            if(lhs !== rhs) continue;
        }
        await transformer.doUpdate(matchingElement, uow, u);
    }
}