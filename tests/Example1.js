import { Transformer } from '../Transform.js';
const div = self['div'];
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
    span.id = 'span';
    div.appendChild(span);
}, 100);
setTimeout(() => {
    model.greeting = 'bye';
    propagator.dispatchEvent(new Event('greeting'));
}, 200);
