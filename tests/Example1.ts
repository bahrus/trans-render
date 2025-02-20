import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model{
    greeting: string;
}
const div = (<any>self)['div'];

const model = {
    greeting: 'hello'
} as Model & RoundaboutReady;

Transform<Model>(div, model, {
    span: {
        o: ['greeting'],
        d: 0
    },
});
setTimeout(() => {
    const span = document.createElement('span');
    span.id = 'span';
    div.appendChild(span);
}, 100);
setTimeout(() => {
    model.greeting = 'bye';
}, 200);
