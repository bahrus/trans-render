import {Transform} from '../Transform.js';

interface Model{
    greeting: string;
}
const div = (<any>self)['div'];

const model: Model = {
    greeting: 'hello'
};
Transform<Model>(div, model, {
    span: {
        o: ['greeting'],
        d: 0
    },
});
setTimeout(() => {
    const span = document.createElement('span');
    span.id = 'span';
    div.appendChild(span);
}, 100);
setTimeout(() => {
    model.greeting = 'bye';
}, 200);
