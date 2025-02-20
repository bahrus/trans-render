import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model = {
    greeting: 'hello'
} as any as Model & RoundaboutReady;

Transform<Model>(div, model, {
    span: {
        o: ['greeting'],
        d: 0,
        
    },
    411: {
        w: '[nyy]'
    }
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    //propagator.dispatchEvent(new Event('greeting'));
}, 2000);
