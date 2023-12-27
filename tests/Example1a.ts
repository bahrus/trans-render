import {Transform} from '../Transform.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    greeting: 'hello'
};
const propagator = new EventTarget();

Transform<Model>(div, model, {
    span: 'greeting',
}, propagator);
setTimeout(() => {
    const span = document.createElement('span');
    span.id = 'span';
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    propagator.dispatchEvent(new Event('greeting'));
}, 2000);
