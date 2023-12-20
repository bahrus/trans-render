import {Transform} from '../../index.js';

interface Model{
    msg1: string;
    rO: boolean;
    num: number;
}

const div = document.querySelector('div')!;
const model: Model = {
    msg1: '123',
    rO: true,
    num: 7
};
const et = new EventTarget();

Transform<Model>(div, model, {
    input: {
        o: ['msg1', 'rO', 'num'],
        u: {
            readOnly: 1,
            tabIndex: 2,
            value: 0,
            type: 'number',
            disabled: true
        } 
    }
}, et);

setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 1000);
setTimeout(() => {
    model.msg1 = '456';
    et.dispatchEvent(new Event('msg1'));
}, 2000);
