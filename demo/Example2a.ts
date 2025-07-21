import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model{
    greeting: string;
}

const form = document.querySelector('form')!;
const model = {
    greeting: 'hello'
} as Model & RoundaboutReady;

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
