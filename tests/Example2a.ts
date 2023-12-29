import {Transform} from '../Transform.js';

interface IModel{
    greeting: string;
}

const form = document.querySelector('form')!;
const model: IModel = {
    greeting: 'hello'
};

Transform<IModel>(form, model, {
    '@ greeting': 0,
});
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
