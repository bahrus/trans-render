import { stdVal } from '../stdVal.js';
export function fromList(el, itemprops) {
    const data = [];
    const itemScopes = el.querySelectorAll('[itemscope]');
    for (const itemScope of itemScopes) {
        const item = {};
        // const item = {
        //     key: itemScope.querySelector('[itemprop="key"]')?.textContent?.trim() ?? '',
        //     value: Number( /** @type {HTMLDataElement} **/(itemScope.querySelector('data[itemprop="value"]'))?.value),
        // };
        for (const prop of itemprops) {
            const itemProp = itemScope.querySelector(`[itemprop="${prop}"]`);
            if (itemProp === null) {
                continue;
            }
            item[prop] = stdVal(itemProp);
        }
        data.push(item);
    }
    return data;
}
