import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
Transform(div, model, {
    span: {
        o: ['greeting'],
        d: 0,
    },
    411: {
        w: '[nyy]'
    }
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    //propagator.dispatchEvent(new Event('greeting'));
}, 2000);
