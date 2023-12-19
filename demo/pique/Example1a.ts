import {Transformer} from '../../index.js';

interface IModel{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: IModel = {
    greeting: 'hello'
};
const et = new EventTarget();

const transform = new Transformer<IModel>(div, model, {
    span: 'greeting',
}, et);
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    et.dispatchEvent(new Event('greeting'));
}, 2000);
