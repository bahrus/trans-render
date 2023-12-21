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
    input: [
        {o: 'msg1', s: 'value'},
        {o: 'rO',   s: 'readOnly'},
        {o: 'num',  s: 'tabIndex'},
        {
            s: {
                type: 'number',
                disabled: true
            } as Partial<HTMLInputElement>
        }
    ]
}, et);

setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 1000);
setTimeout(() => {
    model.msg1 = '456';
    et.dispatchEvent(new Event('msg1'));
}, 2000);
