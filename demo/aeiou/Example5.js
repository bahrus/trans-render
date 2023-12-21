import { Transform } from '../../index.js';
const div = document.querySelector('div');
const model = {
    msg1: '123',
    rO: true,
    num: 7,
    hydrateInputElement: (m, el, ctx) => {
        console.log({ m, el, ctx });
    }
};
const et = new EventTarget();
Transform(div, model, {
    input: [
        { o: 'msg1', s: 'value' },
        { o: 'rO', s: 'readOnly' },
        { o: 'num', s: 'tabIndex' },
        {
            s: {
                type: 'number',
                disabled: true
            },
            e: {
                do: 'hydrateInputElement',
                with: {
                    beCommitted: true
                }
            }
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
setTimeout(() => {
    div.innerHTML = '';
}, 15000);
