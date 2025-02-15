import {stdVal} from '../stdVal.js';

export function fromList<TProps = any>(el: Element, itemprops: Array<keyof TProps & string>){
    const data: Array<Partial<TProps>> = [];

    const itemScopes = el.querySelectorAll('[itemscope]');
    
    for(const itemScope of itemScopes){
        const item : Partial<TProps> = {};
        for(const prop of itemprops){
            const itemProp = itemScope.querySelector(`[itemprop="${prop}"]`);
            if(itemProp === null){
                continue;
            }
            item[prop] = stdVal(itemProp);
        }
        data.push(item);
    }
    return data;
}