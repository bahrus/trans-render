import { Transformer } from '../../Transform.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
const propagator = new EventTarget();
const transform = new Transformer(div, model, {
    span: {
        o: ['greeting'],
        d: 0
    },
}, propagator);
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    propagator.dispatchEvent(new Event('greeting'));
}, 2000);
