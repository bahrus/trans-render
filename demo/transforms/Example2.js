import { Transformer } from '../../Transform.js';
const form = document.querySelector('form');
const model = {
    greeting: 'hello'
};
const propagator = new EventTarget();
const transform = new Transformer(form, model, {
    '@ greeting': 0,
}, propagator);
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    propagator.dispatchEvent(new Event('greeting'));
}, 2000);
