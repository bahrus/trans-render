import { Transformer } from '../../index.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
const et = new EventTarget();
const transform = new Transformer(div, model, {
    span: {
        o: ['greeting'],
        d: 0
    },
}, et);
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    et.dispatchEvent(new Event('greeting'));
}, 2000);
