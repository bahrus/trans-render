import {MountOrchestrator, Transformer, arr} from '../Transform.js';
import {YieldSettings, ConditionGate, UnitOfWork} from '../types.js';
export async function doYield<TProps extends {}, TMethods = TProps, TElement = {}>(
    transformer: Transformer<TProps, TMethods, TElement>, 
    matchingElement: Element, 
    uow: UnitOfWork<TProps, TMethods, TElement>, 
    y: YieldSettings<TProps> | number
){
    const {model} = transformer;
    const {o} = uow;
    const observeArr = arr(o);
    const to = typeof y === 'number' ? observeArr![y] : y.to;
    (<any>model)[to] = matchingElement.textContent;
}