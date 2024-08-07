import { arr0 } from '../Transform.js';
import { getUIVal } from './getUIVal.js';
export async function doYield(transformer, matchingElement, uow, y) {
    const { model } = transformer;
    const { o } = uow;
    const observeArr = arr0(o);
    const yIsNum = typeof y === 'number';
    const to = yIsNum ? observeArr[y] : y.to;
    let val = getUIVal(matchingElement);
    if (typeof val === 'string' && !yIsNum) {
        const { as } = y;
        if (as !== undefined) {
            switch (as) {
                case 'number':
                    val = Number(val);
                    break;
                case 'date':
                    val = new Date(val);
                    break;
                default:
                    throw 'NI';
            }
        }
    }
    model[to] = val;
}
