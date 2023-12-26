import { Transform } from '../../Transform.js';
const div = document.querySelector('div');
const model = {
    msg1: '123',
    rO: true,
    num: 7,
    hydrateInputElement: (model, el, ctx) => {
        console.log({ model, el, ctx });
    }
};
const propagator = new EventTarget();
Transform(div, model, {
    input: [
        { o: 'msg1', s: 'value' },
        { o: 'rO', s: 'readOnly' },
        { o: 'num', s: 'tabIndex' },
        { o: 'num', s: '.dataset.num' },
        {
            s: {
                type: 'number',
                disabled: true
            },
            e: 'hydrateInputElement'
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
setTimeout(() => {
    div.innerHTML = '';
}, 15000);
