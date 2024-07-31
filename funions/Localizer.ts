import {UnitOfWork, ITransformer} from '../ts-refs/trans-render/types';
import {LocalizerMethods, LocalizerType} from '../ts-refs/trans-render/funions/types';
export {LocalizerProps, LocalizerMethods} from '../ts-refs/trans-render/funions/types';


export const localize = (model: any, transformer: ITransformer<any, any>, uow: UnitOfWork<any, any>, matchingElement: Element) => {
    const {o} = uow;
    const a = o as string[];
    if(a.length !== 1) throw 'NI';
    const val = model[a[0]];
    const {localName} = matchingElement;
    switch(typeof val){
        case 'undefined':
            return val;
        case 'number':
        case 'boolean':
            switch(localName){
                case 'data':{
                    return {
                        value: val.toString(),
                        textContent: val.toLocaleString()
                    } as Partial<HTMLDataElement>
                }
            }
            return val.toLocaleString();
        default:
            if(val instanceof Date){
                switch(localName){
                    case 'time':
                        return {
                            dateTime: val.toUTCString(),
                            textContent: val.toLocaleString()
                        } as Partial<HTMLTimeElement>
                }
            }else{
                throw 'NI'
            }

    }
}

