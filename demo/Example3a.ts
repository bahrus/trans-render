import {Transform} from '../Transform.js';

interface Model{
    msg1: string;
    msg2: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    msg1: 'hello',
    msg2: 'world'
};

Transform<Model>(div, model, {
    span: {
        o: ['msg1', 'msg2'],
        d: ['msg1: ', 0, ', msg2: ', 1]
    }
});

setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.msg1 = 'bye';
}, 2000);
