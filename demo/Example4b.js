import { Transform } from '../Transform.js';
const model = {
    greeting: 'hello',
    msg1: 'this is a test'
};
const form = document.querySelector('form');
Transform(form, model, {
    '-o msg1 -s ariaLabel': 0,
    '-o msg1 -s ariaRoleDescription': 0
});
