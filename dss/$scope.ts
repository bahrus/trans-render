import {$copeDetail} from '../ts-refs/trans-render/dss/types';

export function $cope(el: Element, $copeDetail: $copeDetail){
    const {ceName, itemProp} = $copeDetail;
    const {id} = el;
    const itemScopeVal = ceName ? `=${ceName}` : '';
    const itemPropVal = itemProp ? `[itemprop=${itemProp}]` : '';
    const qry = `[itemscope${itemScopeVal}]${itemPropVal}`;
    if(id){
        const qry1 = `${qry}[itemref~=${}]`;
    }
    
}