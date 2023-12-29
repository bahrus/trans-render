import { Transform } from '../Transform.js';
const div = self['div'];
const model = {
    greeting: 'hello'
};
Transform(div, model, {
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
