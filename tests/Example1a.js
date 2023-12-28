import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
const propagator = new EventTarget();
Transform(div, model, {
    span: 'greeting',
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
