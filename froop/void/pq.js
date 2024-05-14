import { all } from '../../lib/all.js';
import { none } from './none.js';
import { eq } from './eq.js';
import { oneOf } from './oneOf.js';
export function pq(expr, src) {
    const { ifAllOf, ifNoneOf, ifEquals, ifAtLeastOneOf } = expr;
    if (ifAllOf !== undefined) {
        //const {all} = await import('./all.js');
        if (!all(ifAllOf, src))
            return false;
    }
    if (ifNoneOf !== undefined) {
        //const {none} = await import('./none.js');
        if (!none(ifNoneOf, src))
            return false;
    }
    if (ifEquals !== undefined) {
        //const {eq} = await import('./eq.js');
        if (!eq(ifEquals, src))
            return false;
    }
    if (ifAtLeastOneOf !== undefined) {
        //const {oneOf} = await import('./oneOf.js');
        if (!oneOf(ifAtLeastOneOf, src))
            return false;
    }
    return true;
}
