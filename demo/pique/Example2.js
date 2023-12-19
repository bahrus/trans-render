import { Transformer } from '../../index.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
const et = new EventTarget();
const transform = new Transformer(div, model, {
    '$ 0': {
        o: ['greeting'],
        u: 0
    },
}, et);
setTimeout(() => {
    const section = document.createElement('section');
    section.setAttribute('itemprop', 'greeting');
    div.appendChild(section);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    et.dispatchEvent(new Event('greeting'));
}, 2000);
