import { Transform } from '../Transform.js';
const model = {
    greeting: 'hello',
    count: 123456,
    now: new Date(),
};
const div = document.querySelector('div');
Transform(div, model, {
    span: 'greeting',
    data: 'count',
    time: 'now',
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
