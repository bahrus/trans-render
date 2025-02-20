import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model = {
    greeting: 'hello'
} as Model & RoundaboutReady;

Transform<Model>(div, model, {
    ":root": 'greeting',
});

setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
