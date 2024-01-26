import { Transform } from '../Transform.js';
const model = {
    greeting: 'hello',
    msg1: 'thi is a test'
};
const form = document.querySelector('form');
Transform(form, model, {
    '-o greeting -s ariaLabel': 0,
    '-o msg1 -s ariaRoleDescription': 0
});
