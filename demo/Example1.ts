import {Transform} from '../Transform.js';
import { HS } from '../types.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    greeting: 'hello'
};
//const propagator = new EventTarget();

const spanTest: HS<Model> = 'span';

Transform<Model>(div, model, {
    [spanTest]: {
        o: ['greeting'],
        d: 0
    },
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
    //propagator.dispatchEvent(new Event('greeting'));
}, 2000);
