import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    msg1: '123',
    rO: true,
    num: 7,
    hydrateInputElement: (model, el, ctx) => {
        window['target'].setAttribute('mark', 'good');
    },
    cleanupInputElement: (model, el, ctx) => {
        console.log({ model, el, ctx });
    }
};
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
            e: {
                do: 'hydrateInputElement',
                forget: 'cleanupInputElement',
                //be: 'committed',
                with: {
                    to: 'change'
                }
            }
        }
    ]
});
setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 100);
setTimeout(() => {
    model.msg1 = '456';
}, 200);
// setTimeout(() => {
//     div.innerHTML = '';
// }, 15000)
