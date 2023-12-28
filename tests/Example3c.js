import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    msg1: 'hello',
    msg2: 'world',
    computeMessage: ({ msg1, msg2 }) => {
        return `msg1: ${msg1}, msg2: ${msg2}`;
    }
};
const propagator = new EventTarget();
Transform(div, model, {
    span: {
        o: ['msg1', 'msg2'],
        d: ({ msg1, msg2 }) => `msg1: ${msg1}, msg2: ${msg2}`
    }
}, propagator);
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 100);
setTimeout(() => {
    model.msg1 = 'bye';
    propagator.dispatchEvent(new Event('msg1'));
}, 200);
