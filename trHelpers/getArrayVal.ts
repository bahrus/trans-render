import { InterpolatingExpression, NumberExpression, UnitOfWork } from "trans-render/types";
import {Transformer} from '../Transform.js';

export function getArrayVal<TProps extends {}, TMethods, TElement = {}>(transformer: Transformer<TProps, TMethods, TElement>, uow: UnitOfWork<TProps, TMethods, TElement>, u: NumberExpression | InterpolatingExpression){
    if(u.length === 1 && typeof u[0] === 'number') return u[0];
    const mapped = u.map(x => {
        switch(typeof x){
            case 'number':
                return transformer.getNumberUVal(uow, x);
            case 'string':
                return x;
            default:
                throw 'NI';
        }
    });
    return mapped.join('');
}