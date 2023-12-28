import {Transformer} from '../Transform.js';

interface Model{
    greeting: string;
}
const div = (<any>self)['div'];

const model: Model = {
    greeting: 'hello'
};
const propagator = new EventTarget();

const transform = new Transformer<Model>(div, model, {
    span: {
        o: ['greeting'],
        d: 0
    },
}, propagator);
setTimeout(() => {
    const span = document.createElement('span');
    span.id = 'span';
    div.appendChild(span);
}, 100);
setTimeout(() => {
    model.greeting = 'bye';
    propagator.dispatchEvent(new Event('greeting'));
}, 200);
