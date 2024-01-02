import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
//const propagator = new EventTarget();
const spanTest = 'span';
Transform(div, model, {
    [spanTest]: {
        o: ['greeting'],
        d: 0
    },
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    //propagator.dispatchEvent(new Event('greeting'));
}, 2000);
