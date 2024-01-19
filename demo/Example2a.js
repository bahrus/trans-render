import { Transform } from '../Transform.js';
const form = document.querySelector('form');
const model = {
    greeting: 'hello'
};
Transform(form, model, {
    '@ greeting': 0
});
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
