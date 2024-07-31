import { UnitOfWork } from '../ts-refs/trans-render/types.js'; 
import {Transformer} from '../Transform.js';
import { DerivationCriteria } from '../ts-refs/trans-render/types.js'; 
import { } from '../lib/convert.js';

export async function getComplexDerivedVal<TProps extends {}, TMethods, TElement = {}>(
transformer: Transformer<TProps, TMethods, TElement>, uow: UnitOfWork<TProps, TMethods, TElement>, 
dc: DerivationCriteria<TProps, TMethods>){
    const {from, path, as} = dc;
    const idx = from || 0;
    let val = transformer.getNumberUVal(uow, idx);
    if(path !== undefined){
        const dPath = path[0] === '.' ? path : '.' + path
        const {getVal} = await import('../lib/getVal.js');
        val = await getVal({host: val},  dPath);
    }
    if(as !== undefined){
        const {convert} = await import('../lib/convert.js');
        val = convert(val, as);
    }
    return val;
}