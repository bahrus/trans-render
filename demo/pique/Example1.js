import { Transformer } from '../../index.js';
const div = document.querySelector('div');
const model = {
    greeting: 'hello'
};
const transform = new Transformer(div, model, {
    piques: [
        {
            p: ['greeting'],
            q: 'span'
        }
    ]
});
