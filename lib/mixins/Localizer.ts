import {UnitOfWork, ITransformer} from '../../types';
import {LocalizerType} from './types';
export {LocalizerProps, LocalizerMethods} from './types';

export const Localizer = (superclass: LocalizerType) => class extends superclass{
    localize(model: any, transformer: ITransformer<any, any>, uow: UnitOfWork<any, any>){
        const {o} = uow;
        const a = o as string[];
        if(a.length !== 1) throw 'NI';
        const val = model[a[0]];
        if(val instanceof Date){
            return val.toLocaleDateString();
        }else if(typeof val === 'number'){
            return val.toLocaleString();
        }
        throw 'NI';
    }
}