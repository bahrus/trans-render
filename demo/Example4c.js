import { Transform } from '../Transform.js';
const model = {
    msg1: 'this is a test',
    msg2: 'this is another test'
};
const form = document.querySelector('form');
const test = 'helo';
Transform(form, model, {
    '-o msg1 -o msg2 -s textContent': {
        d: ['msg1: ', 0, 'msg2: ', 1]
    }
});
