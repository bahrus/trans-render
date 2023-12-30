import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
const tr = await Transform(div, model, {
    span: 'greeting',
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    tr.updateModel({
        greeting: 'bye'
    });
}, 2000);
