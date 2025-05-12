import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model{
    greeting: string;
    count: number;
    now: Date;
}


const model = {
    greeting: 'hello',
    count: 123456,
    now: new Date(),
} as Model & RoundaboutReady;

const div = document.querySelector('div')!;

Transform<Model>(div, model, {
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
