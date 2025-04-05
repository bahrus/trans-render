export function $cope(el, $copeDetail) {
    const { ceName, itemProp } = $copeDetail;
    const { id } = el;
    const itemScopeVal = ceName ? `="${ceName}"` : '';
    const itemPropVal = itemProp ? `[itemprop="${itemProp}"]` : '';
    const qry = `[itemscope${itemScopeVal}]${itemPropVal}`;
    let test1 = null;
    if (id) {
        const qry1 = `${qry}[itemref~=${id}]`;
        test1 = el.getRootNode().querySelector(qry1);
    }
    if (test1 === null) {
        test1 = el.closest(qry);
    }
    if (test1 === null)
        return test1;
    const returnObj = {
        home: test1,
    };
    const itemRef = test1.getAttribute('itemref');
    if (itemRef) {
        const refs = itemRef.split(' ');
        const rn = el.getRootNode();
        const satellites = [];
        for (const ref of refs) {
            const elRef = rn.getElementById(ref);
            if (elRef !== null) {
                satellites.push(elRef);
            }
        }
        returnObj.satellites = satellites;
    }
    return returnObj;
}
