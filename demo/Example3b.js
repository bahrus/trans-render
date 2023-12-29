import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    msg1: 'hello',
    msg2: 'world',
    computeMessage: ({ msg1, msg2 }) => {
        return `msg1: ${msg1}, msg2: ${msg2}`;
    }
};
Transform(div, model, {
    span: {
        o: ['msg1', 'msg2'],
        d: 'computeMessage'
    }
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.msg1 = 'bye';
}, 2000);
