import { decorate } from '../plugins/decorate.js';
const testArr = ['a', 'b', 'c'];
function test(h) {
    decorate(h, {
        propVals: {
            href: 'hello',
            style: {},
        }
    });
}
