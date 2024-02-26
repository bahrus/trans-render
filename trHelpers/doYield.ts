import {MountOrchestrator, Transformer, arr} from '../Transform.js';
import {YieldSettings, ConditionGate, UnitOfWork} from '../types.js';
import {getUIVal} from './getUIVal.js';
export async function doYield<TProps extends {}, TMethods = TProps, TElement = {}>(
    transformer: Transformer<TProps, TMethods, TElement>, 
    matchingElement: Element, 
    uow: UnitOfWork<TProps, TMethods, TElement>, 
    y: YieldSettings<TProps> | number
){
    const {model} = transformer;
    const {o} = uow;
    const observeArr = arr(o);
    const yIsNum = typeof y === 'number';
    const to = yIsNum ? observeArr![y] : y.to;
    let val = getUIVal(matchingElement);
    if(typeof val === 'string' && !yIsNum){
        const {as} = y;
        if(as !== undefined){
            switch(as){
                case 'number':
                    val = Number(val);
                    break;
                case 'date':
                    val = new Date(val);
                    break;
                default:
                    throw 'NI';
            }
        }
    }
    (<any>model)[to] = val;
}