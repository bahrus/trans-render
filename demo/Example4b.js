import { Transform } from '../Transform.js';
const model = {
    greeting: 'hello',
    msg1: 'thi is a test'
};
const div = document.querySelector('div');
Transform(div, model, {
    '-o greeting -s ariaLabel': 0,
    '-o msg1 -s ariaRoleDescription': 0
});
