import {Transform} from '../Transform.js';
import { LHS } from '../types.js';

interface Model{
    greeting: string;
}

const form = document.querySelector('form')!;
const model: Model = {
    greeting: 'hello'
};
const lhs: LHS<Model>[] = ['@ greeting'];

Transform<Model>(form, model, {
    [lhs[0]]: 0
});
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
