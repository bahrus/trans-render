import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model{
    greeting: string;
}

const itemscope = document.querySelector('[itemscope]')!;
const model = {
    greeting: 'hello'
} as Model & RoundaboutReady;

Transform<Model>(itemscope, model, {
    '| greeting': 0
});
setTimeout(() => {
    const span = document.createElement('span');
    span.setAttribute('itemprop', 'greeting');
    itemscope.appendChild(span);
    const childScope = itemscope.querySelector('[itemscope]')!;
    const anotherSpan = document.createElement('span');
    anotherSpan.setAttribute('itemprop', 'greeting');
    childScope.appendChild(anotherSpan);
    
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
