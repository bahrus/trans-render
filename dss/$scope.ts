import {$copeDetail, $ScopeHierarchy} from '../ts-refs/trans-render/dss/types';

export function $cope(el: Element, $copeDetail: $copeDetail){
    const {ceName, itemProp} = $copeDetail;
    const {id} = el;
    const itemScopeVal = ceName ? `="${ceName}"` : '';
    const itemPropVal = itemProp ? `[itemprop="${itemProp}"]` : '';
    const qry = `[itemscope${itemScopeVal}]${itemPropVal}`;
    let test1: Element | null = null;
    if(id){
        const qry1 = `${qry}[itemref~=${id}]`;
        test1= (el.getRootNode() as DocumentFragment).querySelector(qry1);
    }
    if(test1=== null){
        test1 = el.closest(qry);
    }
    if(test1 === null) return test1;
    const returnObj: $ScopeHierarchy = {
        home: test1,
    };
    const itemRef = test1.getAttribute('itemref');
    if(itemRef){
        const refs = itemRef.split(' ');
        const rn = el.getRootNode() as DocumentFragment;
        const satellites: Array<Element> = [];
        for(const ref of refs){
            const elRef = rn.getElementById(ref);
            if(elRef !== null){
                satellites.push(elRef);
            }
        }
        returnObj.satellites = satellites;
    }
    return returnObj;
    
}