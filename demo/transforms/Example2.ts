import {Transformer} from '../../Transform.js';

interface IModel{
    greeting: string;
}

const form = document.querySelector('form')!;
const model: IModel = {
    greeting: 'hello'
};
const propagator = new EventTarget();

const transform = new Transformer<IModel>(form, model, {
    '@ greeting': 0,
}, et);
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    et.dispatchEvent(new Event('greeting'));
}, 2000);
