import { Transform } from '../../index.js';
const div = document.querySelector('div');
const model = {
    msg1: '123',
    rO: true,
    num: 7
};
const et = new EventTarget();
Transform(div, model, {
    input: {
    // o: ['msg1', 'rO', 'num'],
    // a: {
    //     value: 0,
    //     readOnly: 'r0',
    //     tabIndex: 'num'
    // },
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
