import { decorate } from '../decorate.js';
const testArr = ['a', 'b', 'c'];
function test(h) {
    decorate(h, {
        propVals: {
            href: 'hello',
            style: {},
        }
    });
}
