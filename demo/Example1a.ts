import {Transform} from '../Transform.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    greeting: 'hello'
};

Transform<Model>(div, model, {
    span: 'greeting',
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
