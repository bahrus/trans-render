import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model = {
    greeting: 'hello'
} as Model & RoundaboutReady;

const tr = await Transform<Model>(div, model, {
    span: 'greeting',
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(async () => {
    await tr.updateModel({
        greeting: 'bye'
    } as any) 
}, 2000);
