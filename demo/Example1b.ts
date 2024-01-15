import {Transform} from '../Transform.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    greeting: 'hello'
};

Transform<Model>(div, model, {
    ":root": 'greeting',
});

setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
