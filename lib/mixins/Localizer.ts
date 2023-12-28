import {UnitOfWork, ITransformer} from '../../types';
import {LocalizerMethods, LocalizerType} from './types';
export {LocalizerProps, LocalizerMethods} from './types';

export const Localizer = (superclass: LocalizerType) => class extends superclass implements LocalizerMethods{
    localize(model: any, transformer: ITransformer<any, any>, uow: UnitOfWork<any, any>, matchingElement: Element){
        console.log({matchingElement});
        const {o} = uow;
        const a = o as string[];
        if(a.length !== 1) throw 'NI';
        const val = model[a[0]];
        if(val instanceof Date){
            return val.toLocaleDateString();
        }else if(typeof val === 'number'){
            const {localName} = matchingElement;
            switch(localName){
                case 'data':{
                    return {
                        value: val.toString(),
                        textContent: val.toLocaleString()
                    } as Partial<HTMLDataElement>
                }
            }
            return val.toLocaleString();
        }
        throw 'NI';
    }
}