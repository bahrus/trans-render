import { Transform } from '../Transform.js';
const form = document.querySelector('form');
const model = {
    greeting: 'hello',
    appendWorld: ({ greeting }, transform, uow) => {
        console.log({ transform, uow });
        return greeting + ', world';
    }
};
Transform(form, model, {
    '@ greeting': 'appendWorld',
});
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
