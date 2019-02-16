import { decorate } from '../decorate.js';
function test(h) {
    decorate(h, {
        href: 'hello',
        style: {},
    });
}
