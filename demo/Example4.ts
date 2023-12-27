import {Transform} from '../Transform.js';

interface Model{
    msg1: string;
    rO: boolean;
    num: number;
    propName: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    msg1: '123',
    rO: true,
    num: 7,
    propName: 'test'
};
const propagator = new EventTarget();

Transform<Model>(div, model, {
    input: [
        {o: 'msg1', s: 'value'},
        {o: 'rO',   s: 'readOnly'},
        {o: 'num',  s: 'tabIndex'},
        {o: 'num',  s: '.dataset.num'}, 
        {o: 'propName', sa: 'itemprop'},
        {
            s: {
                type: 'number',
                disabled: true
            } as Partial<HTMLInputElement>
        }
    ]
}, propagator);

setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 1000);
setTimeout(() => {
    model.msg1 = '456';
    propagator.dispatchEvent(new Event('msg1'));
}, 2000);
