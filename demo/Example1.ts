import {Transform} from '../Transform.js';

interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    greeting: 'hello'
};
//const propagator = new EventTarget();


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
