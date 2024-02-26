import { arr } from '../Transform.js';
export async function doYield(transformer, matchingElement, uow, y) {
    const { model } = transformer;
    const { o } = uow;
    const observeArr = arr(o);
    const to = typeof y === 'number' ? observeArr[y] : y.to;
    model[to] = matchingElement.textContent;
}
