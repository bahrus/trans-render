import { Transform } from '../Transform.js';
const model = {
    count: 30000,
};
const div = document.querySelector('div');
Transform(div, model, {
    button: {
        m: {
            on: 'click',
            inc: 'count',
            byAmt: '.dataset.d'
        }
    },
    '% count': 0
});
