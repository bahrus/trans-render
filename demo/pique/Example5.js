import { Transformer } from '../../index.js';
const div = document.querySelector('div');
const model = {
    msg1: '123',
    rO: true,
    num: 7,
    onInput: (m, el, ctx) => {
        console.log({ m, el, ctx });
    }
};
const et = new EventTarget();
const transform = new Transformer(div, model, {
    input: {
        o: ['msg1', 'rO', 'num'],
        u: {
            readOnly: 1,
            tabIndex: 2,
            value: 0,
            type: 'number',
            disabled: true
        },
        e: {
            do: 'onInput',
            with: {
                beCommitted: true
            }
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
setTimeout(() => {
    div.innerHTML = '';
}, 5000);
