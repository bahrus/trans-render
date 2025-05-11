import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello',
    count: 123456
};
Transform(div, model, {
    //span: 'greeting',
    data: 'count',
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
