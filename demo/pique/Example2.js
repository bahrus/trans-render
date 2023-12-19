import { Transformer } from '../../index.js';
const form = document.querySelector('form');
const model = {
    greeting: 'hello'
};
const et = new EventTarget();
const transform = new Transformer(form, model, {
    '@ 0': {
        o: ['greeting'],
        u: 0
    },
}, et);
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    et.dispatchEvent(new Event('greeting'));
}, 2000);
