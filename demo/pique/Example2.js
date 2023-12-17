import { Transformer } from '../../index.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
const transform = new Transformer(div, model, {
    piqueMap: {
        span: {
            p: ['greeting'],
            u: 0
        }
    }
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
