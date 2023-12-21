import {Transformer} from '../../index.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    greeting: 'hello'
};
const et = new EventTarget();

const transform = new Transformer<Model>(div, model, {
    span: {
        o: ['greeting'],
        d: 0
    },
}, et);
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    et.dispatchEvent(new Event('greeting'));
}, 2000);
