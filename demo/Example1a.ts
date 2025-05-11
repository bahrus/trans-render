import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model{
    greeting: string;
    count: number;
}

const div = document.querySelector('div')!;
const model = {
    greeting: 'hello',
    count: 123456
} as Model & RoundaboutReady;

Transform<Model>(div, model, {
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
