import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    msg1: '123',
    rO: true,
    num: 7,
    propName: 'test'
};
const propagator = new EventTarget();
Transform(div, model, {
    input: [
        { o: 'msg1', s: 'value' },
        { o: 'rO', s: 'readOnly' },
        { o: 'num', s: 'tabIndex' },
        { o: 'num', s: '.dataset.num' },
        { o: 'propName', sa: 'itemprop' },
        {
            s: {
                type: 'number',
                disabled: true
            }
        }
    ]
}, propagator);
setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 100);
setTimeout(() => {
    model.msg1 = '456';
    propagator.dispatchEvent(new Event('msg1'));
}, 200);
