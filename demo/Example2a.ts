import {Transform} from '../Transform.js';
import { LHS } from '../ts-refs/trans-render/types.js';

interface Model{
    greeting: string;
}

const form = document.querySelector('form')!;
const model: Model = {
    greeting: 'hello'
};

Transform<Model>(form, model, {
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
