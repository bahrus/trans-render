import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
Transform(div, model, {
    ":root": 'greeting',
});
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
